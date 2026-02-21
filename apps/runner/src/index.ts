import "dotenv/config";
import { Worker } from "bullmq";
import { QUEUE_NAME, type RunJob } from "@vibe/shared";
import { env } from "./env.ts";
import { prisma } from "./prisma.ts";
import { runBuild } from "./runDocker.ts";

const worker = new Worker<RunJob>(
  QUEUE_NAME,
  async (job) => {
    const payload = job.data;
    await prisma.run.update({ where: { id: payload.runId }, data: { status: "RUNNING" } });
    const { ok, logs } = await runBuild(payload.workspacePath);
    await prisma.run.update({
      where: { id: payload.runId },
      data: { status: ok ? "READY_TO_DEPLOY" : "FAILED", logs }
    });
    return { ok };
  },
  { connection: { url: env.REDIS_URL } }
);

worker.on("completed", (job) => console.log("completed", job.id));
worker.on("failed", (job, err) => console.error("failed", job?.id, err));
console.log("Runner started.");
