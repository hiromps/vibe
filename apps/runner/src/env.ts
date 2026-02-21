export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  RUNNER_DOCKER_IMAGE: process.env.RUNNER_DOCKER_IMAGE ?? "node:20-bullseye",
};
