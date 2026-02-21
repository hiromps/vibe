import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRunQueue } from "@/lib/queue";
import type { RunJob } from "@vibe/shared";
import { env } from "@/lib/env";
import fs from "node:fs/promises";
import path from "node:path";

const WORKSPACE_SLUG_REGEX = /^[a-zA-Z0-9._-]+$/;

function resolveWorkspacePath(workspaceSlug: string) {
  if (!WORKSPACE_SLUG_REGEX.test(workspaceSlug)) {
    return { error: "workspaceSlug contains invalid characters" } as const;
  }

  const root = path.resolve(env.WORKSPACES_ROOT);
  const resolved = path.resolve(root, workspaceSlug);
  if (!resolved.startsWith(`${root}${path.sep}`)) {
    return { error: "workspaceSlug must resolve under WORKSPACES_ROOT" } as const;
  }

  return { resolved } as const;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const branchId = body?.branchId as string | undefined;
  const workspaceSlug = body?.workspaceSlug as string | undefined;

  if (!branchId || !workspaceSlug) {
    return NextResponse.json({ error: "branchId and workspaceSlug are required" }, { status: 400 });
  }

  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) {
    return NextResponse.json({ error: "branch not found" }, { status: 404 });
  }

  const workspace = resolveWorkspacePath(workspaceSlug);
  if ("error" in workspace) {
    return NextResponse.json({ error: workspace.error }, { status: 400 });
  }

  try {
    const stat = await fs.stat(workspace.resolved);
    if (!stat.isDirectory()) {
      return NextResponse.json({ error: "workspace path is not a directory" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "workspace path not found" }, { status: 404 });
  }

  const run = await prisma.run.create({
    data: {
      branchId,
      status: "QUEUED",
      attempt: 0,
      taskId: "BUILD"
    }
  });

  try {
    const job: RunJob = {
      runId: run.id,
      branchId,
      kind: "BUILD",
      workspacePath: workspace.resolved
    };

    await getRunQueue().add("run", job, {
      removeOnComplete: 50,
      removeOnFail: 50
    });

    return NextResponse.json({ runId: run.id });
  } catch {
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        errorTop: "Queue enqueue failed"
      }
    });

    return NextResponse.json({ error: "failed to enqueue run" }, { status: 500 });
  }
}

export async function GET() {
  const runs = await prisma.run.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { branch: { include: { project: true } } }
  });
  return NextResponse.json(runs);
}
