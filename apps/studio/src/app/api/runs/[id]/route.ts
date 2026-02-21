import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const run = await prisma.run.findUnique({
    where: { id: params.id },
    include: { branch: { include: { project: true } } }
  });
  if (!run) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(run);
}
