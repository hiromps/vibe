import { Queue } from "bullmq";
import { QUEUE_NAME } from "@vibe/shared";
import { env } from "./env";

export const runQueue = new Queue(QUEUE_NAME, {
  connection: { url: env.REDIS_URL }
});
