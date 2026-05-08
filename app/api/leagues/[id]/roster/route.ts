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

  const slots = await prisma.rosterSlot.findMany({ where: { leagueId: id } });
  return NextResponse.json(slots);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const membership = await prisma.leagueMember.findFirst({
    where: { leagueId: id, userId: session.user.id },
  });
  if (membership?.role !== "COMMISSIONER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const slots: { position: string; count: number }[] = await req.json();

  await prisma.$transaction(
    slots.map((s) =>
      prisma.rosterSlot.upsert({
        where: { leagueId_position: { leagueId: id, position: s.position as never } },
        create: { leagueId: id, position: s.position as never, count: s.count },
        update: { count: s.count },
      })
    )
  );

  const updated = await prisma.rosterSlot.findMany({ where: { leagueId: id } });
  return NextResponse.json(updated);
}
