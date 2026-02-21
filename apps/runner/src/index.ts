import "dotenv/config";
import { Worker } from "bullmq";
import { QUEUE_NAME, type RunJob } from "@vibe/shared";
import { env } from "./env.ts";
import { prisma } from "./prisma.ts";
import { runBuild } from "./runDocker.ts";

function topError(message: string) {
  return message.split("\n").slice(0, 10).join("\n").slice(0, 4000);
}

const worker = new Worker<RunJob>(
  QUEUE_NAME,
  async (job) => {
    const payload = job.data;

    await prisma.run.update({
      where: { id: payload.runId },
      data: { status: "RUNNING", attempt: { increment: 1 } }
    });

    try {
      const { ok, logs } = await runBuild(payload.workspacePath);

      await prisma.run.update({
        where: { id: payload.runId },
        data: {
          status: ok ? "READY_TO_DEPLOY" : "FAILED",
          logs,
          errorTop: ok ? null : topError(logs)
        }
      });

      return { ok };
    } catch (error) {
      const message = error instanceof Error ? error.stack ?? error.message : String(error);
      await prisma.run.update({
        where: { id: payload.runId },
        data: {
          status: "FAILED",
          errorTop: topError(message)
        }
      });
      throw error;
    }
  },
  { connection: { url: env.REDIS_URL } }
);

worker.on("completed", (job) => console.log("completed", job.id));
worker.on("failed", (job, err) => console.error("failed", job?.id, err));
console.log("Runner started.");
