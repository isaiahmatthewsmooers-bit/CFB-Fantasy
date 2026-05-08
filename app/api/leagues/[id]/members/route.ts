import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const membership = await prisma.leagueMember.findFirst({
    where: { leagueId: id, userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await prisma.leagueMember.findMany({
    where: { leagueId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const callerMembership = await prisma.leagueMember.findFirst({
    where: { leagueId: id, userId: session.user.id },
  });
  if (callerMembership?.role !== "COMMISSIONER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { memberId } = await req.json();
  const target = await prisma.leagueMember.findUnique({ where: { id: memberId } });

  if (!target || target.leagueId !== id) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  if (target.role === "COMMISSIONER") {
    return NextResponse.json({ error: "Cannot remove the commissioner." }, { status: 400 });
  }

  await prisma.leagueMember.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}
