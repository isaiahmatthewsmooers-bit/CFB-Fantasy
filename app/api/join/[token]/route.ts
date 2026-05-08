import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const { teamName } = await req.json();

  if (!teamName) return NextResponse.json({ error: "teamName is required" }, { status: 400 });

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { league: { include: { _count: { select: { members: true } } } } },
  });

  if (!invitation) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  if (invitation.status !== "PENDING") {
    return NextResponse.json({ error: "Invitation has already been used or expired." }, { status: 410 });
  }
  if (new Date() > invitation.expiresAt) {
    await prisma.invitation.update({ where: { token }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "Invitation has expired." }, { status: 410 });
  }
  if (invitation.league._count.members >= invitation.league.maxTeams) {
    return NextResponse.json({ error: "League is full." }, { status: 400 });
  }

  const existing = await prisma.leagueMember.findFirst({
    where: { leagueId: invitation.leagueId, userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "You are already in this league." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.leagueMember.create({
      data: {
        leagueId: invitation.leagueId,
        userId: session.user.id,
        teamName,
        role: "MEMBER",
      },
    }),
    prisma.invitation.update({
      where: { token },
      data: { status: "ACCEPTED" },
    }),
  ]);

  return NextResponse.json({ leagueId: invitation.leagueId });
}
