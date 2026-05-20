/**
 * Pipeline Controller — Copilot Extension
 *
 * A visual orchestration layer for the RPIV pipeline using @github/copilot-sdk.
 * Launches a web UI and creates a Copilot session with custom tools for
 * controlling pipeline stages (Research, Plan, Implement, Verify).
 */

import { CopilotClient, defineTool, approveAll } from "@github/copilot-sdk";
import { createServer } from "./server.js";
import { PipelineState, STAGES, StageId, StageStatus } from "./state.js";
import { STAGE_INFO } from "./stage-info.js";
import { validateIssue, checkPrerequisites } from "./validate.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Pipeline Controller — Copilot Extension

Usage: npx tsx src/index.ts <issue_number> [--port <port>]

Options:
  --port <port>  HTTP server port (default: 8080)
  --help, -h     Show this help message

This extension uses @github/copilot-sdk to create an interactive pipeline
controller with a visual web UI and AI-powered stage execution.
`);
  process.exit(0);
}

const issueNumber = parseInt(args[0], 10);
if (!issueNumber || issueNumber <= 0) {
  console.error("Error: Please provide a valid positive issue number.");
  console.error("Usage: npx tsx src/index.ts <issue_number> [--port <port>]");
  process.exit(1);
}

const portIdx = args.indexOf("--port");
const port = portIdx !== -1 ? parseInt(args[portIdx + 1], 10) : 8080;

async function main() {
  // Check prerequisites
  await checkPrerequisites();

  // Validate issue exists
  await validateIssue(issueNumber);

  // Initialize pipeline state
  const state = new PipelineState(issueNumber);
  await state.init();

  console.log(`\n🚀 Pipeline Controller Extension`);
  console.log(`   Issue: #${issueNumber}`);
  console.log(`   SDK: @github/copilot-sdk`);

  // Define custom tools for the Copilot session
  const getPipelineState = defineTool("get_pipeline_state", {
    description:
      "Get the current state of the RPIV pipeline including all stage statuses",
    parameters: { type: "object", properties: {}, required: [] },
    handler: async () => {
      return state.read();
    },
  });

  const runStage = defineTool("run_stage", {
    description:
      "Start running a pipeline stage. Only works if the stage is in 'ready' status.",
    parameters: {
      type: "object",
      properties: {
        stage_id: {
          type: "string",
          enum: ["research", "plan", "implement", "verify"],
          description: "The stage to run",
        },
      },
      required: ["stage_id"],
    },
    handler: async (args: { stage_id: string }) => {
      const stageId = args.stage_id as StageId;
      const currentStatus = state.getStageStatus(stageId);

      if (currentStatus !== "ready") {
        return {
          error: `Stage '${stageId}' cannot be started — current status is '${currentStatus}'. Only 'ready' stages can be started.`,
        };
      }

      state.setStageStatus(stageId, "running");
      return {
        success: true,
        message: `Stage '${stageId}' is now running.`,
        state: state.read(),
      };
    },
  });

  const completeStage = defineTool("complete_stage", {
    description:
      "Mark a running stage as complete. This unlocks the next stage.",
    parameters: {
      type: "object",
      properties: {
        stage_id: {
          type: "string",
          enum: ["research", "plan", "implement", "verify"],
          description: "The stage to complete",
        },
      },
      required: ["stage_id"],
    },
    handler: async (args: { stage_id: string }) => {
      const stageId = args.stage_id as StageId;
      const currentStatus = state.getStageStatus(stageId);

      if (currentStatus !== "running") {
        return {
          error: `Stage '${stageId}' cannot be completed — current status is '${currentStatus}'. Only 'running' stages can be completed.`,
        };
      }

      state.setStageStatus(stageId, "done");
      return {
        success: true,
        message: `Stage '${stageId}' completed. Next stage unlocked.`,
        state: state.read(),
      };
    },
  });

  const getStageInfo = defineTool("get_stage_info", {
    description:
      "Get detailed information about a pipeline stage including its purpose, inputs, and outputs",
    parameters: {
      type: "object",
      properties: {
        stage_id: {
          type: "string",
          enum: ["research", "plan", "implement", "verify"],
          description: "The stage to get info for",
        },
      },
      required: ["stage_id"],
    },
    handler: async (args: { stage_id: string }) => {
      const stageId = args.stage_id as StageId;
      return STAGE_INFO[stageId];
    },
  });

  // Start the web UI server
  const server = createServer(state, port);
  console.log(`   UI: http://localhost:${port}`);
  console.log(`\n   Press Ctrl+C to stop\n`);

  // Create Copilot SDK session with custom tools
  let client: CopilotClient | null = null;
  try {
    client = new CopilotClient();
    const session = await client.createSession({
      model: "gpt-4.1",
      streaming: true,
      tools: [getPipelineState, runStage, completeStage, getStageInfo],
      onPermissionRequest: approveAll,
    });

    console.log(`   ✅ Copilot SDK session active (tools registered)`);
    console.log(
      `   Tools: get_pipeline_state, run_stage, complete_stage, get_stage_info\n`
    );

    // Listen for session events
    session.on("assistant.message_delta", (event) => {
      process.stdout.write(event.data.deltaContent);
    });

    session.on("session.idle", () => {
      // Session is idle, ready for next interaction
    });

    // Send initial context to the session
    await session.sendAndWait({
      prompt: `You are the Pipeline Controller for issue #${issueNumber}. You have tools to manage the RPIV pipeline stages (Research, Plan, Implement, Verify). The pipeline is initialized with Research in 'ready' state. Wait for user instructions to advance stages.`,
    });
  } catch (err) {
    console.log(
      `   ⚠️  Copilot SDK session unavailable (web UI still works)`
    );
    console.log(`   Reason: ${(err as Error).message}\n`);
  }

  // Handle shutdown
  const shutdown = () => {
    console.log("\n\nShutting down...");
    server.close();
    if (client) {
      client.stop().catch(() => {});
    }
    state.cleanup();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
