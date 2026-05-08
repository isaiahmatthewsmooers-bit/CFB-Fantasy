import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/utils";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const membership = await prisma.leagueMember.findFirst({
    where: { leagueId: id, userId: session.user.id },
  });
  if (membership?.role !== "COMMISSIONER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const invitations = await prisma.invitation.findMany({
    where: { leagueId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invitations);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const membership = await prisma.leagueMember.findFirst({
    where: { leagueId: id, userId: session.user.id },
  });
  if (membership?.role !== "COMMISSIONER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  const league = await prisma.league.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  });
  if (!league) return NextResponse.json({ error: "League not found" }, { status: 404 });
  if (league._count.members >= league.maxTeams) {
    return NextResponse.json({ error: "League is full." }, { status: 400 });
  }

  const alreadyMember = await prisma.leagueMember.findFirst({
    where: { leagueId: id, user: { email } },
  });
  if (alreadyMember) return NextResponse.json({ error: "User is already a member." }, { status: 409 });

  const invitation = await prisma.invitation.upsert({
    where: { leagueId_email: { leagueId: id, email } },
    create: {
      leagueId: id,
      email,
      invitedById: session.user.id,
      expiresAt: addDays(new Date(), 7),
      status: "PENDING",
    },
    update: {
      status: "PENDING",
      expiresAt: addDays(new Date(), 7),
    },
  });

  return NextResponse.json(invitation, { status: 201 });
}
