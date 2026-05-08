import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Users, Trophy, Calendar, Crown } from "lucide-react";

const statusVariants: Record<string, "default" | "warning" | "success" | "secondary"> = {
  SETUP: "secondary",
  DRAFTING: "warning",
  ACTIVE: "success",
  ARCHIVED: "default",
};

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { id } = await params;

  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      commissioner: { select: { id: true, name: true } },
      members: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { members: true } },
    },
  });

  if (!league) notFound();

  const myMembership = league.members.find((m) => m.userId === session.user!.id);
  if (!myMembership) redirect("/dashboard");

  const isCommissioner = myMembership.role === "COMMISSIONER";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{league.name}</h1>
            <Badge variant={statusVariants[league.status] ?? "default"}>{league.status}</Badge>
          </div>
          {league.description && (
            <p className="mt-1 text-muted-foreground">{league.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {league.season} Season
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {league._count.members}/{league.maxTeams} Teams
            </span>
            <span className="flex items-center gap-1">
              <Crown className="h-4 w-4" />
              Commissioner: {league.commissioner.name}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/leagues/${id}/members`}>
              <Users className="mr-1 h-4 w-4" />
              Members
            </Link>
          </Button>
          {isCommissioner && (
            <Button asChild>
              <Link href={`/leagues/${id}/settings`}>
                <Settings className="mr-1 h-4 w-4" />
                Settings
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-primary" />
              My Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{myMembership.teamName}</p>
            <p className="text-sm text-muted-foreground capitalize">
              Role: {myMembership.role.toLowerCase()}
            </p>
          </CardContent>
        </Card>

        {/* League Members */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Teams ({league._count.members}/{league.maxTeams})
              </span>
              {isCommissioner && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/leagues/${id}/members`}>Manage</Link>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {league.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{member.teamName}</p>
                    <p className="text-xs text-muted-foreground">{member.user.name}</p>
                  </div>
                  {member.role === "COMMISSIONER" && (
                    <Badge variant="outline" className="text-xs">
                      <Crown className="mr-1 h-3 w-3" />
                      Commissioner
                    </Badge>
                  )}
                </div>
              ))}
              {league._count.members < league.maxTeams && (
                <div className="py-2.5 text-sm text-muted-foreground">
                  {league.maxTeams - league._count.members} spot
                  {league.maxTeams - league._count.members > 1 ? "s" : ""} remaining
                  {isCommissioner && (
                    <Link
                      href={`/leagues/${id}/members`}
                      className="ml-2 text-primary underline underline-offset-4"
                    >
                      Invite members
                    </Link>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
