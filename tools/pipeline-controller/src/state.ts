/**
 * Pipeline state machine.
 *
 * States: locked → ready → running → done
 *                            ↓
 *                          failed → ready (retry)
 *
 * Gating: when stage N becomes 'done', stage N+1 becomes 'ready'.
 */

import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

export type StageStatus = "locked" | "ready" | "running" | "done" | "failed";
export type StageId = "research" | "plan" | "implement" | "verify";

export const STAGES: StageId[] = ["research", "plan", "implement", "verify"];

export interface StageState {
  id: StageId;
  name: string;
  status: StageStatus;
  updatedAt: string;
}

export interface PipelineStateData {
  issue: number;
  repo: string;
  stages: StageState[];
  createdAt: string;
  lastUpdated: string;
}

const STAGE_NAMES: Record<StageId, string> = {
  research: "Research",
  plan: "Plan",
  implement: "Implement",
  verify: "Verify",
};

export class PipelineState {
  private data: PipelineStateData;
  private filePath: string;

  constructor(issueNumber: number) {
    const repoRoot = execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
    }).trim();
    this.filePath = join(repoRoot, ".pipeline-state.json");

    const repo = execSync(
      'gh repo view --json nameWithOwner -q ".nameWithOwner"',
      { encoding: "utf-8" }
    ).trim();

    const now = new Date().toISOString();
    this.data = {
      issue: issueNumber,
      repo,
      stages: STAGES.map((id, index) => ({
        id,
        name: STAGE_NAMES[id],
        status: index === 0 ? "ready" : "locked",
        updatedAt: now,
      })),
      createdAt: now,
      lastUpdated: now,
    };
  }

  async init(): Promise<void> {
    this.save();
  }

  read(): PipelineStateData {
    return structuredClone(this.data);
  }

  getStageStatus(stageId: StageId): StageStatus {
    const stage = this.data.stages.find((s) => s.id === stageId);
    if (!stage) throw new Error(`Unknown stage: ${stageId}`);
    return stage.status;
  }

  setStageStatus(stageId: StageId, status: StageStatus): void {
    const stageIndex = STAGES.indexOf(stageId);
    if (stageIndex === -1) throw new Error(`Unknown stage: ${stageId}`);

    const stage = this.data.stages[stageIndex];
    const currentStatus = stage.status;

    // Validate transitions
    if (!this.isValidTransition(currentStatus, status)) {
      throw new Error(
        `Invalid transition: ${stageId} cannot go from '${currentStatus}' to '${status}'`
      );
    }

    const now = new Date().toISOString();
    stage.status = status;
    stage.updatedAt = now;
    this.data.lastUpdated = now;

    // Gating logic: when a stage becomes 'done', unlock the next stage
    if (status === "done" && stageIndex < STAGES.length - 1) {
      const nextStage = this.data.stages[stageIndex + 1];
      if (nextStage.status === "locked") {
        nextStage.status = "ready";
        nextStage.updatedAt = now;
      }
    }

    this.save();
  }

  private isValidTransition(from: StageStatus, to: StageStatus): boolean {
    const validTransitions: Record<StageStatus, StageStatus[]> = {
      locked: ["ready"],
      ready: ["running"],
      running: ["done", "failed"],
      done: [],
      failed: ["ready"],
    };
    return validTransitions[from].includes(to);
  }

  private save(): void {
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2) + "\n");
  }

  cleanup(): void {
    if (existsSync(this.filePath)) {
      unlinkSync(this.filePath);
    }
  }

  getFilePath(): string {
    return this.filePath;
  }
}
