import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPlanJson } from "@/lib/branch-generation";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const branch = await prisma.branch.findUnique({
    where: { id },
    select: { id: true, name: true, specYaml: true }
  });

  if (!branch) {
    return NextResponse.json({ error: "branch not found" }, { status: 404 });
  }

  if (!branch.specYaml) {
    return NextResponse.json({ error: "specYaml is empty. Generate spec first." }, { status: 400 });
  }

  const plan = buildPlanJson(branch.specYaml);

  const updated = await prisma.branch.update({
    where: { id },
    data: { planJson: JSON.stringify(plan, null, 2) },
    select: { id: true, name: true, planJson: true }
  });

  return NextResponse.json(updated);
}
