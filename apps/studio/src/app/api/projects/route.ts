import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name : "My Project";
  const project = await prisma.project.create({
    data: {
      name,
      branches: { create: [{ name: "main" }] }
    },
    include: { branches: true }
  });
  return NextResponse.json(project);
}
