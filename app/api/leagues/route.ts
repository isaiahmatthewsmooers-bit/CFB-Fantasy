import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SCORING_RULES, DEFAULT_ROSTER_SLOTS } from "@/prisma/seed";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.leagueMember.findMany({
    where: { userId: session.user.id },
    include: {
      league: {
        include: {
          commissioner: { select: { name: true, email: true } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json(memberships);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, season, maxTeams, teamName, scoringRules, rosterSlots } =
    await req.json();

  if (!name || !season || !teamName) {
    return NextResponse.json({ error: "name, season, and teamName are required." }, { status: 400 });
  }

  const rules: { statCategory: string; pointValue: number }[] =
    scoringRules ?? DEFAULT_SCORING_RULES;
  const slots: { position: string; count: number }[] =
    rosterSlots ?? DEFAULT_ROSTER_SLOTS;

  const league = await prisma.league.create({
    data: {
      name,
      description: description ?? null,
      season: Number(season),
      maxTeams: Number(maxTeams ?? 10),
      commissionerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          teamName,
          role: "COMMISSIONER",
        },
      },
      scoringRules: {
        create: rules.map((r) => ({
          statCategory: r.statCategory,
          pointValue: r.pointValue,
        })),
      },
      rosterSlots: {
        create: slots.map((s) => ({
          position: s.position as never,
          count: s.count,
        })),
      },
    },
    include: {
      members: true,
      scoringRules: true,
      rosterSlots: true,
    },
  });

  return NextResponse.json(league, { status: 201 });
}
