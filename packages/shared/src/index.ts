export const QUEUE_NAME = "vibe-runs";
export type RunJob = {
  runId: string;
  branchId: string;
  kind: "BUILD" | "FIX";
  workspacePath: string; // host path (absolute), runner will mount it
};
