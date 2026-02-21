import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runQueue } from "@/lib/queue";
import type { RunJob } from "@vibe/shared";
import { env } from "@/lib/env";
import path from "node:path";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const branchId = body?.branchId as string | undefined;
  const workspaceSlug = body?.workspaceSlug as string | undefined; 

  if (!branchId || !workspaceSlug) {
    return NextResponse.json({ error: "branchId and workspaceSlug are required" }, { status: 400 });
  }

  const run = await prisma.run.create({
    data: {
      branchId,
      status: "QUEUED",
      attempt: 0,
      taskId: "BUILD"
    }
  });

  const workspacePath = path.join(env.WORKSPACES_ROOT, workspaceSlug);
  const job: RunJob = { runId: run.id, branchId, kind: "BUILD", workspacePath };
  await runQueue.add("run", job, { removeOnComplete: 50, removeOnFail: 50 });

  return NextResponse.json({ runId: run.id });
}

export async function GET() {
  const runs = await prisma.run.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { branch: { include: { project: true } } }
  });
  return NextResponse.json(runs);
}
