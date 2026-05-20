/**
 * Stage metadata derived from AGENTS.md PIPELINE_STAGES definitions.
 */

import { StageId } from "./state.js";

export interface StageInfo {
  id: StageId;
  name: string;
  purpose: string;
  input: string;
  output: string;
}

export const STAGE_INFO: Record<StageId, StageInfo> = {
  research: {
    id: "research",
    name: "Research",
    purpose:
      "Explore the problem space, classify scope, produce a research brief",
    input: "GitHub issue body and acceptance criteria, existing codebase and documentation",
    output: "project/issues/<N>/research/00-research.md",
  },
  plan: {
    id: "plan",
    name: "Plan",
    purpose:
      "Commit architectural decisions via ADRs and core-components, then produce the action plan, task breakdown, and test plan",
    input: "Research brief from previous stage",
    output:
      "ADR documents, core-components, project/issues/<N>/plan/01-action-plan.md, 02-task-breakdown.md, 03-test-plan.md",
  },
  implement: {
    id: "implement",
    name: "Implement",
    purpose: "Execute tasks, write code and tests, verify against the plan",
    input: "Task breakdown and test plan from Plan stage",
    output: "Source code, test files, project/issues/<N>/implementation/README.md",
  },
  verify: {
    id: "verify",
    name: "Verify",
    purpose: "Run tests, commit, push, and open a pull request for review",
    input: "Completed implementation and test results",
    output: "Git commits, pushed branch, pull request URL",
  },
};
