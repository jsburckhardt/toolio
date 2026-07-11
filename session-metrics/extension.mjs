// Extension: session-metrics
// Collects token consumption and friction signals for the CURRENT Copilot CLI
// session, entirely in-memory from live SDK events. Nothing is read from disk
// or sent anywhere. State resets when the extension reloads (e.g. on /clear),
// so every metric is scoped to the running session.
//
// It contributes one tool, `session_metrics`, that reports what the session has
// cost so far and where it hit friction. It also logs a summary when the
// session ends.

import { writeFileSync } from "node:fs";
import { joinSession } from "@github/copilot-sdk/extension";

const VERSION = "0.1.0";

// --- friction thresholds (transparent, one place) ----------------------------
const SLOW_TTFT_MS = 15_000; // first token slower than this = friction
const SLOW_TTFT_RATIO_HIGH = 0.25; // >25% of calls slow => high severity
const LONG_REQUEST_MS = 90_000; // a single call longer than this = friction
const CONTEXT_PRESSURE_RATIO = 0.85; // context window >85% full = friction
const CACHE_LOW_RATIO = 0.3; // <30% input from cache (>=5 calls) = costly
const CACHE_MIN_CALLS = 5;
const REASONING_HIGH_RATIO = 0.6; // reasoning >60% of output = heavy thinking
const SEVERITY_PENALTY = { high: 25, medium: 12, low: 4 };

// --- in-memory state for THIS session ----------------------------------------
function freshState() {
    return {
        startedAt: new Date(),
        sessionId: null,
        requests: 0,
        turns: 0,
        permissionRequests: 0,
        tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0 },
        costMultiplierSum: 0,
        costCalls: 0,
        totalApiDurationMs: 0,
        totalNanoAiu: null, // finalized at session shutdown
        durations: [],
        ttfts: [],
        models: new Map(), // model -> {requests,input,output,nanoOrCost}
        context: { peakTokens: 0, tokenLimit: 0 },
        // friction accumulators
        slowTtft: 0,
        longRequests: 0,
        lengthCapped: 0,
        contentFilter: 0,
        toolCalls: 0,
        toolFailures: [], // {tool,error,at}
        modelFailures: [], // {model,errorType,at}
        truncations: 0,
        messagesTruncated: 0,
        compactions: 0,
        errors: [], // {context,recoverable,message,at}
        notes: [], // self-reported friction notes
    };
}

let state = freshState();

// --- small helpers -----------------------------------------------------------
const num = (v) => (typeof v === "number" && isFinite(v) ? v : 0);
const n = (v) => Math.round(num(v)).toLocaleString("en-US");
const secs = (ms) => (ms == null ? "n/a" : `${(num(ms) / 1000).toFixed(1)}s`);
const short = (id) => (id ? String(id).slice(0, 8) : "unknown");

function avg(xs) {
    const v = xs.filter((x) => typeof x === "number");
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}
function pct(xs, p) {
    const v = xs.filter((x) => typeof x === "number").sort((a, b) => a - b);
    if (!v.length) return null;
    const k = (v.length - 1) * p;
    const lo = Math.floor(k);
    const hi = Math.ceil(k);
    return lo === hi ? v[lo] : v[lo] + (v[hi] - v[lo]) * (k - lo);
}
function fmtDuration(sec) {
    if (sec == null) return "n/a";
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h) return `${h}h${String(m).padStart(2, "0")}m`;
    if (m) return `${m}m${String(s).padStart(2, "0")}s`;
    return `${s}s`;
}

// --- friction derivation -----------------------------------------------------
function findings() {
    const out = [];
    const reqs = state.requests || 1;

    if (state.slowTtft > 0) {
        const ratio = state.slowTtft / reqs;
        out.push({
            signal: "slow_first_token",
            severity: ratio > SLOW_TTFT_RATIO_HIGH ? "high" : "medium",
            count: state.slowTtft,
            detail: `${state.slowTtft}/${state.requests} model calls waited >${SLOW_TTFT_MS / 1000}s for the first token (max ${secs(pct(state.ttfts, 1))}).`,
        });
    }
    if (state.longRequests > 0)
        out.push({ signal: "long_requests", severity: "medium", count: state.longRequests,
            detail: `${state.longRequests} model call(s) ran longer than ${LONG_REQUEST_MS / 1000}s.` });
    if (state.lengthCapped > 0)
        out.push({ signal: "length_capped", severity: "high", count: state.lengthCapped,
            detail: `${state.lengthCapped} response(s) were truncated by an output length limit (finishReason=length).` });
    if (state.contentFilter > 0)
        out.push({ signal: "content_filter", severity: "high", count: state.contentFilter,
            detail: `${state.contentFilter} model call(s) triggered a content filter.` });
    if (state.toolFailures.length > 0) {
        const tools = [...new Set(state.toolFailures.map((f) => f.tool))].join(", ");
        out.push({ signal: "tool_failures", severity: "high", count: state.toolFailures.length,
            detail: `${state.toolFailures.length} tool execution(s) failed (${tools}).` });
    }
    if (state.modelFailures.length > 0)
        out.push({ signal: "model_call_failures", severity: "high", count: state.modelFailures.length,
            detail: `${state.modelFailures.length} model call(s) failed outright.` });
    if (state.errors.length > 0)
        out.push({ signal: "errors", severity: "high", count: state.errors.length,
            detail: `${state.errors.length} error(s) occurred (${[...new Set(state.errors.map((e) => e.context))].join(", ")}).` });
    if (state.truncations > 0)
        out.push({ signal: "context_truncation", severity: "medium", count: state.truncations,
            detail: `Context was truncated ${state.truncations} time(s), dropping ~${n(state.messagesTruncated)} messages.` });
    if (state.compactions > 0)
        out.push({ signal: "context_compaction", severity: "medium", count: state.compactions,
            detail: `Conversation was compacted ${state.compactions} time(s) under context pressure.` });
    if (state.context.tokenLimit > 0) {
        const ratio = state.context.peakTokens / state.context.tokenLimit;
        if (ratio > CONTEXT_PRESSURE_RATIO)
            out.push({ signal: "context_pressure", severity: "low", count: 1,
                detail: `Context window peaked at ${Math.round(ratio * 100)}% (${n(state.context.peakTokens)}/${n(state.context.tokenLimit)} tokens).` });
    }
    if (state.requests >= CACHE_MIN_CALLS && state.tokens.input > 0) {
        const cr = state.tokens.cacheRead / state.tokens.input;
        if (cr < CACHE_LOW_RATIO)
            out.push({ signal: "low_cache_reuse", severity: "low", count: state.requests,
                detail: `Only ${Math.round(cr * 100)}% of input tokens came from cache — context is being re-sent (higher cost).` });
    }
    if (state.tokens.output > 0) {
        const rr = state.tokens.reasoning / state.tokens.output;
        if (rr > REASONING_HIGH_RATIO)
            out.push({ signal: "heavy_reasoning", severity: "low", count: state.requests,
                detail: `Reasoning tokens are ${Math.round(rr * 100)}% of output — heavy thinking overhead.` });
    }
    return out;
}

function frictionScore(list) {
    const penalty = list.reduce((a, f) => a + (SEVERITY_PENALTY[f.severity] || 0), 0);
    const score = Math.max(0, 100 - penalty);
    const level = score >= 100 ? "none" : score >= 75 ? "low" : score >= 45 ? "moderate" : "high";
    return { score, level };
}

function snapshot() {
    const list = findings();
    const { score, level } = frictionScore(list);
    const t = state.tokens;
    return {
        tool: "session-metrics",
        version: VERSION,
        generatedAt: new Date().toISOString(),
        session: { id: state.sessionId, startedAt: state.startedAt.toISOString() },
        wallSeconds: (Date.now() - state.startedAt.getTime()) / 1000,
        activity: {
            requests: state.requests,
            turns: state.turns,
            toolCalls: state.toolCalls,
            permissionRequests: state.permissionRequests,
        },
        tokens: {
            input: t.input,
            output: t.output,
            cacheRead: t.cacheRead,
            cacheWrite: t.cacheWrite,
            reasoning: t.reasoning,
            total: t.input + t.output,
            billedInputEst: Math.max(0, t.input - t.cacheRead),
        },
        cost: {
            totalAiu: state.totalNanoAiu == null ? null : state.totalNanoAiu / 1e9,
            avgModelMultiplier: state.costCalls ? state.costMultiplierSum / state.costCalls : null,
            apiDurationMs: state.totalApiDurationMs,
        },
        models: [...state.models.values()]
            .map((m) => ({ ...m }))
            .sort((a, b) => b.input + b.output - (a.input + a.output)),
        latency: {
            avgRequestMs: avg(state.durations),
            maxRequestMs: state.durations.length ? Math.max(...state.durations) : null,
            avgTtftMs: avg(state.ttfts),
            p90TtftMs: pct(state.ttfts, 0.9),
            maxTtftMs: state.ttfts.length ? Math.max(...state.ttfts) : null,
        },
        context: state.context,
        friction: { score, level, findings: list, notes: state.notes },
    };
}

// --- renderers ---------------------------------------------------------------
function renderText(s) {
    const L = [];
    L.push(`Copilot session metrics · ${short(s.session.id)}  (v${s.version})`);
    L.push("=".repeat(58));
    L.push(`  session : ${s.session.id || "n/a"}`);
    L.push(`  elapsed : ${fmtDuration(s.wallSeconds)}`);
    L.push(`  activity: ${s.activity.requests} model calls · ${s.activity.turns} turns · ${s.activity.toolCalls} tool calls`);
    if (s.activity.requests === 0) {
        L.push("");
        L.push("  No model calls recorded yet this session.");
        if (s.friction.notes.length) renderNotesText(L, s.friction.notes);
        return L.join("\n");
    }
    const t = s.tokens;
    L.push("");
    L.push("── Token consumption ──");
    L.push(`  input        ${n(t.input).padStart(14)}   (billed est. ${n(t.billedInputEst)})`);
    L.push(`  output       ${n(t.output).padStart(14)}`);
    L.push(`  cache read   ${n(t.cacheRead).padStart(14)}   (cached input, cheaper)`);
    L.push(`  cache write  ${n(t.cacheWrite).padStart(14)}`);
    L.push(`  reasoning    ${n(t.reasoning).padStart(14)}`);
    L.push(`  total i/o    ${n(t.total).padStart(14)}`);
    if (s.cost.totalAiu != null) L.push(`  cost         ${s.cost.totalAiu.toFixed(2).padStart(14)}   AIU`);
    else if (s.cost.avgModelMultiplier != null)
        L.push(`  cost         ${("×" + s.cost.avgModelMultiplier.toFixed(1)).padStart(14)}   avg multiplier (AIU finalized at session end)`);

    L.push("");
    L.push("── By model ──");
    for (const m of s.models)
        L.push(`  ${String(m.model).padEnd(22)} ${String(m.requests).padStart(3)} calls · in ${n(m.input)} / out ${n(m.output)}`);

    const lat = s.latency;
    L.push("");
    L.push("── Latency ──");
    L.push(`  avg call      ${secs(lat.avgRequestMs)}   (max ${secs(lat.maxRequestMs)})`);
    L.push(`  time-to-first ${secs(lat.avgTtftMs)} avg · ${secs(lat.p90TtftMs)} p90 · ${secs(lat.maxTtftMs)} max`);
    if (s.context.tokenLimit > 0)
        L.push(`  context peak  ${n(s.context.peakTokens)} / ${n(s.context.tokenLimit)} tokens (${Math.round((s.context.peakTokens / s.context.tokenLimit) * 100)}%)`);

    const fr = s.friction;
    L.push("");
    L.push(`── Friction · score ${fr.score}/100 (${fr.level}) ──`);
    if (!fr.findings.length) L.push("  ✓ no automatic friction signals detected");
    for (const f of fr.findings) {
        const mark = { high: "!!", medium: "! ", low: "· " }[f.severity] || "  ";
        L.push(`  ${mark} [${f.severity}] ${f.detail}`);
    }
    if (fr.notes.length) renderNotesText(L, fr.notes);
    return L.join("\n");
}
function renderNotesText(L, notes) {
    L.push("");
    L.push("── Self-reported friction notes ──");
    for (const nt of notes) L.push(`  • ${nt}`);
}

function renderMarkdown(s) {
    const t = s.tokens;
    const M = [];
    M.push(`# Copilot session metrics — \`${short(s.session.id)}\``);
    M.push("");
    M.push(`- **Session:** \`${s.session.id || "n/a"}\``);
    M.push(`- **Elapsed:** ${fmtDuration(s.wallSeconds)}`);
    M.push(`- **Activity:** ${s.activity.requests} model calls · ${s.activity.turns} turns · ${s.activity.toolCalls} tool calls`);
    M.push(`- **Generated:** ${s.generatedAt} by \`${s.tool}\` v${s.version}`);
    M.push("");
    if (s.activity.requests === 0) {
        M.push("_No model calls recorded yet this session._");
        M.push("");
    } else {
        M.push("## Token consumption");
        M.push("");
        M.push("| Metric | Tokens |");
        M.push("|---|--:|");
        M.push(`| Input | ${n(t.input)} |`);
        M.push(`| Input (billed est.) | ${n(t.billedInputEst)} |`);
        M.push(`| Output | ${n(t.output)} |`);
        M.push(`| Cache read | ${n(t.cacheRead)} |`);
        M.push(`| Cache write | ${n(t.cacheWrite)} |`);
        M.push(`| Reasoning | ${n(t.reasoning)} |`);
        M.push(`| **Total I/O** | **${n(t.total)}** |`);
        M.push("");
        if (s.cost.totalAiu != null) M.push(`**Cost:** ${s.cost.totalAiu.toFixed(2)} AIU across ${s.activity.requests} model calls.`);
        else M.push(`**Cost:** ${s.activity.requests} model calls (AIU finalized at session end).`);
        M.push("");
        M.push("### By model");
        M.push("");
        M.push("| Model | Calls | Input | Output |");
        M.push("|---|--:|--:|--:|");
        for (const m of s.models) M.push(`| ${m.model} | ${m.requests} | ${n(m.input)} | ${n(m.output)} |`);
        M.push("");
        const lat = s.latency;
        M.push("## Latency");
        M.push("");
        M.push(`- Avg call: ${secs(lat.avgRequestMs)} (max ${secs(lat.maxRequestMs)})`);
        M.push(`- Time-to-first-token: ${secs(lat.avgTtftMs)} avg · ${secs(lat.p90TtftMs)} p90 · ${secs(lat.maxTtftMs)} max`);
        M.push("");
    }
    const fr = s.friction;
    M.push(`## Friction — score ${fr.score}/100 (${fr.level})`);
    M.push("");
    if (!fr.findings.length) M.push("_No automatic friction signals detected._");
    for (const f of fr.findings) M.push(`- **[${f.severity}]** ${f.detail}`);
    M.push("");
    if (fr.notes.length) {
        M.push("### Self-reported friction notes");
        M.push("");
        for (const nt of fr.notes) M.push(`> ${nt}`);
        M.push("");
    }
    return M.join("\n");
}

// --- join session, wire events + hooks + tool --------------------------------
const session = await joinSession({
    tools: [
        {
            name: "session_metrics",
            description:
                "Report token consumption and friction for the CURRENT Copilot CLI session " +
                "(collected live from session telemetry, in-memory, nothing sent anywhere). " +
                "Use to answer 'what did this session cost and where did it hurt?'. Optionally " +
                "record a self-reported friction note or write a markdown artifact.",
            skipPermission: true,
            parameters: {
                type: "object",
                properties: {
                    format: {
                        type: "string",
                        enum: ["summary", "json", "markdown"],
                        description: "Output format (default: summary).",
                    },
                    note: {
                        type: "string",
                        description: "A self-reported friction note to record for this session.",
                    },
                    write_artifact: {
                        type: "boolean",
                        description: "Write a markdown artifact to disk.",
                    },
                    out: {
                        type: "string",
                        description:
                            "Path for the markdown artifact (implies write_artifact). " +
                            "Default: ./copilot-session-metrics-<id>.md",
                    },
                    reset: {
                        type: "boolean",
                        description: "Clear all collected metrics for this session and start fresh.",
                    },
                },
            },
            handler: async (args = {}, invocation = {}) => {
                try {
                    if (args.reset) {
                        state = freshState();
                        state.sessionId = invocation.sessionId || null;
                        return "session-metrics: collected metrics reset for this session.";
                    }
                    if (!state.sessionId) state.sessionId = invocation.sessionId || null;
                    if (typeof args.note === "string" && args.note.trim()) {
                        state.notes.push(args.note.trim());
                        await session.log(`session-metrics: recorded friction note`, { ephemeral: true });
                    }

                    const snap = snapshot();
                    let artifactMsg = "";
                    if (args.write_artifact || args.out) {
                        const path =
                            (typeof args.out === "string" && args.out.trim()) ||
                            `copilot-session-metrics-${short(snap.session.id)}.md`;
                        writeFileSync(path, renderMarkdown(snap), "utf8");
                        artifactMsg = `\n\n(wrote artifact: ${path})`;
                    }

                    const fmt = args.format || "summary";
                    const body =
                        fmt === "json"
                            ? JSON.stringify(snap, null, 2)
                            : fmt === "markdown"
                              ? renderMarkdown(snap)
                              : renderText(snap);
                    return body + artifactMsg;
                } catch (err) {
                    return {
                        textResultForLlm: `session-metrics failed: ${err?.message || err}`,
                        resultType: "failure",
                    };
                }
            },
        },
    ],
    hooks: {
        // Tool failures are a primary friction signal.
        onPostToolUseFailure: async (input) => {
            try {
                state.toolFailures.push({
                    tool: input?.toolName || "unknown",
                    error: String(input?.error || "").slice(0, 200),
                    at: new Date().toISOString(),
                });
            } catch {}
        },
        // Model/tool/system errors are friction.
        onErrorOccurred: async (input) => {
            try {
                state.errors.push({
                    context: input?.errorContext || "unknown",
                    recoverable: !!input?.recoverable,
                    message: String(input?.error || "").slice(0, 200),
                    at: new Date().toISOString(),
                });
            } catch {}
        },
        // End-of-session summary to the timeline.
        onSessionEnd: async (input) => {
            try {
                const s = snapshot();
                await session.log(
                    `session-metrics: ${s.activity.requests} calls · ${n(s.tokens.total)} tokens · ` +
                        `friction ${s.friction.score}/100 (${s.friction.level})` +
                        (s.friction.findings.length ? ` — ${s.friction.findings.length} signal(s)` : ""),
                );
                return {
                    sessionSummary: `Session used ${n(s.tokens.total)} tokens over ${s.activity.requests} model calls; friction score ${s.friction.score}/100 (${s.friction.level}). Ended: ${input?.reason || "n/a"}.`,
                };
            } catch {}
        },
    },
});

// --- live telemetry subscriptions --------------------------------------------
function bump(model, field, value) {
    if (!model) return;
    const m = state.models.get(model) || { model, requests: 0, input: 0, output: 0 };
    m[field] += value;
    state.models.set(model, m);
}

session.on("assistant.usage", (event) => {
    try {
        const d = event?.data || {};
        state.requests += 1;
        state.tokens.input += num(d.inputTokens);
        state.tokens.output += num(d.outputTokens);
        state.tokens.cacheRead += num(d.cacheReadTokens);
        state.tokens.cacheWrite += num(d.cacheWriteTokens);
        state.tokens.reasoning += num(d.reasoningTokens);
        if (typeof d.cost === "number") {
            state.costMultiplierSum += d.cost;
            state.costCalls += 1;
        }
        if (typeof d.duration === "number") {
            state.durations.push(d.duration);
            state.totalApiDurationMs += d.duration;
            if (d.duration > LONG_REQUEST_MS) state.longRequests += 1;
        }
        if (typeof d.timeToFirstTokenMs === "number") {
            state.ttfts.push(d.timeToFirstTokenMs);
            if (d.timeToFirstTokenMs > SLOW_TTFT_MS) state.slowTtft += 1;
        }
        if (d.model) {
            const m = state.models.get(d.model) || { model: d.model, requests: 0, input: 0, output: 0 };
            m.requests += 1;
            m.input += num(d.inputTokens);
            m.output += num(d.outputTokens);
            state.models.set(d.model, m);
        }
        if (d.finishReason === "length") state.lengthCapped += 1;
        if (d.contentFilterTriggered) state.contentFilter += 1;
    } catch {}
});

session.on("session.usage_info", (event) => {
    try {
        const d = event?.data || {};
        if (typeof d.currentTokens === "number") state.context.peakTokens = Math.max(state.context.peakTokens, d.currentTokens);
        if (typeof d.tokenLimit === "number") state.context.tokenLimit = d.tokenLimit;
    } catch {}
});

session.on("assistant.turn_start", () => {
    state.turns += 1;
});

session.on("tool.execution_complete", (event) => {
    try {
        const d = event?.data || {};
        state.toolCalls += 1;
        if (d.success === false) {
            state.toolFailures.push({
                tool: d.toolDescription?.name || d.model || "tool",
                error: String(d.error?.message || d.error || "").slice(0, 200),
                at: new Date().toISOString(),
            });
        }
    } catch {}
});

session.on("model.call_failure", (event) => {
    try {
        const d = event?.data || {};
        state.modelFailures.push({
            model: d.model || "unknown",
            errorType: d.errorType || d.errorCode || "error",
            at: new Date().toISOString(),
        });
    } catch {}
});

session.on("session.truncation", (event) => {
    try {
        const d = event?.data || {};
        state.truncations += 1;
        state.messagesTruncated += num(d.messagesRemovedDuringTruncation);
    } catch {}
});

session.on("session.compaction_start", () => {
    state.compactions += 1;
});

session.on("permission.requested", () => {
    state.permissionRequests += 1;
});

session.on("session.shutdown", (event) => {
    try {
        const d = event?.data || {};
        if (typeof d.totalNanoAiu === "number") state.totalNanoAiu = d.totalNanoAiu;
    } catch {}
});

await session.log(`session-metrics v${VERSION} ready — call the "session_metrics" tool for a token + friction report.`, {
    ephemeral: true,
});
