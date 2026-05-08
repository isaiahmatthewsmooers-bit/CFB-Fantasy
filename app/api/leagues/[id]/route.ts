import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getLeagueAndMembership(leagueId: string, userId: string) {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      commissioner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      scoringRules: true,
      rosterSlots: true,
      _count: { select: { members: true } },
    },
  });
  if (!league) return { league: null, membership: null };

  const membership = league.members.find((m) => m.userId === userId) ?? null;
  return { league, membership };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { league, membership } = await getLeagueAndMembership(id, session.user.id);

  if (!league) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(league);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { league, membership } = await getLeagueAndMembership(id, session.user.id);

  if (!league) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (membership?.role !== "COMMISSIONER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description, maxTeams, status } = await req.json();

  const updated = await prisma.league.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(maxTeams !== undefined && { maxTeams: Number(maxTeams) }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { league, membership } = await getLeagueAndMembership(id, session.user.id);

  if (!league) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (membership?.role !== "COMMISSIONER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.league.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
