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

  const rules = await prisma.scoringRule.findMany({ where: { leagueId: id } });
  return NextResponse.json(rules);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const membership = await prisma.leagueMember.findFirst({
    where: { leagueId: id, userId: session.user.id },
  });
  if (membership?.role !== "COMMISSIONER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rules: { statCategory: string; pointValue: number }[] = await req.json();

  await prisma.$transaction(
    rules.map((r) =>
      prisma.scoringRule.upsert({
        where: { leagueId_statCategory: { leagueId: id, statCategory: r.statCategory } },
        create: { leagueId: id, statCategory: r.statCategory, pointValue: r.pointValue },
        update: { pointValue: r.pointValue },
      })
    )
  );

  const updated = await prisma.scoringRule.findMany({ where: { leagueId: id } });
  return NextResponse.json(updated);
}
