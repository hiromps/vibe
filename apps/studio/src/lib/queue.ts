import { Queue } from "bullmq";
import { QUEUE_NAME } from "@vibe/shared";
import { env } from "./env";

let queue: Queue | null = null;

export function getRunQueue() {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      connection: { url: env.REDIS_URL }
    });
  }

  return queue;
}
