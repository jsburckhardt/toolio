/**
 * Prerequisite checks and issue validation.
 */

import { execSync } from "child_process";

export async function checkPrerequisites(): Promise<void> {
  // Check gh auth
  try {
    execSync("gh auth status", { stdio: "pipe" });
  } catch {
    console.error("Error: GitHub CLI is not authenticated.");
    console.error("Run: gh auth login");
    process.exit(1);
  }

  // Check node version
  const nodeVersion = process.versions.node;
  const major = parseInt(nodeVersion.split(".")[0], 10);
  if (major < 20) {
    console.error(`Error: Node.js 20+ required (found ${nodeVersion})`);
    process.exit(1);
  }
}

export async function validateIssue(issueNumber: number): Promise<void> {
  try {
    execSync(`gh issue view ${issueNumber} --json number`, { stdio: "pipe" });
  } catch {
    console.error(
      `Error: Issue #${issueNumber} not found in the current repository.`
    );
    console.error("Make sure you're in the correct repository and the issue exists.");
    process.exit(1);
  }
}
