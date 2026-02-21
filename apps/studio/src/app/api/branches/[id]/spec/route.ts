import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSpecYaml } from "@/lib/branch-generation";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const contextValue = typeof body?.context === "string" ? body.context : undefined;

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) {
    return NextResponse.json({ error: "branch not found" }, { status: 404 });
  }

  const specYaml = buildSpecYaml({ prompt, context: contextValue });
  const updated = await prisma.branch.update({
    where: { id },
    data: { specYaml },
    select: { id: true, name: true, specYaml: true }
  });

  return NextResponse.json(updated);
}
