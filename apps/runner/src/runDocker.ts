import { spawn } from "node:child_process";
import { env } from "./env.ts";

export async function runBuild(workspacePath: string): Promise<{ ok: boolean; logs: string }> {
  return new Promise((resolve) => {
    const cmd = "bash";
    const script = "corepack enable " +
      "&& pnpm -v " +
      "&& (pnpm install --frozen-lockfile || pnpm install) " +
      "&& pnpm lint " +
      "&& pnpm build";
    const args = [
      "run", "--rm", "--cpus=2", "--memory=2048m", "--network=bridge",
      "-v", `${workspacePath}:/app`, "-w", "/app",
      env.RUNNER_DOCKER_IMAGE, cmd, "-lc", script
    ];
    const p = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] });
    let logs = "";
    p.stdout.on("data", (d) => (logs += d.toString()));
    p.stderr.on("data", (d) => (logs += d.toString()));
    p.on("close", (code) => resolve({ ok: code === 0, logs }));
  });
}
