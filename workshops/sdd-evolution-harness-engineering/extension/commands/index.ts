/**
 * SDK adapter entrypoint — sdd-evolution-harness-engineering.
 *
 * This is a thin shim that delegates every command to the offline bash
 * entrypoint at `extension/bin/workshop`. The SDK layer adds value only on
 * SDK-only features (inferential coaches, agent-driven scaffolders). When the
 * SDK is unavailable, the bash entrypoint is the canonical implementation.
 *
 * Implementation note: at the time of writing, `@github/copilot-sdk@1.0.0-beta.4`
 * was published to npm but no public command-registration API is documented.
 * This file is therefore a stub. It compiles as TypeScript, declares the same
 * argv contract as the bash entrypoint, and is exercised by the test suite to
 * confirm that every command delegates to `extension/bin/workshop`.
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASH_ENTRYPOINT = resolve(HERE, "..", "bin", "workshop");

export type CommandName =
  | "start" | "install-hooks" | "next" | "status" | "verify" | "coach"
  | "diagnose" | "reset" | "run" | "debrief" | "scaffold" | "override"
  | "reconcile" | "onboard" | "install-promote-ephemeral" | "fan-out"
  | "accept-draft" | "reject-draft" | "help";

export function delegate(cmd: CommandName, args: string[] = []): number {
  const res = spawnSync(BASH_ENTRYPOINT, [cmd, ...args], { stdio: "inherit" });
  return res.status ?? 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , cmd, ...rest] = process.argv;
  process.exit(delegate((cmd ?? "help") as CommandName, rest));
}
