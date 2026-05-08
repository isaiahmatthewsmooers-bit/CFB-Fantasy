import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trophy, Users } from "lucide-react";

const statusColors: Record<string, "default" | "warning" | "success" | "secondary"> = {
  SETUP: "secondary",
  DRAFTING: "warning",
  ACTIVE: "success",
  ARCHIVED: "default",
};

export default async function DashboardPage() {
  const session = await auth();

  const memberships = await prisma.leagueMember.findMany({
    where: { userId: session!.user!.id! },
    include: {
      league: {
        include: {
          commissioner: { select: { name: true } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Leagues</h1>
          <p className="text-muted-foreground">
            {memberships.length === 0
              ? "You haven't joined any leagues yet."
              : `You're in ${memberships.length} league${memberships.length > 1 ? "s" : ""}.`}
          </p>
        </div>
        <Button asChild>
          <Link href="/leagues/create">
            <Plus className="mr-1 h-4 w-4" />
            Create League
          </Link>
        </Button>
      </div>

      {memberships.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-white py-20 text-center">
          <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold">No leagues yet</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Create your own league or ask a commissioner to invite you.
          </p>
          <Button asChild>
            <Link href="/leagues/create">
              <Plus className="mr-1 h-4 w-4" />
              Create Your First League
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map(({ league, role, teamName }) => (
            <Link key={league.id} href={`/leagues/${league.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{league.name}</CardTitle>
                    <Badge variant={statusColors[league.status] ?? "default"}>
                      {league.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {teamName}
                    {role === "COMMISSIONER" && (
                      <span className="ml-2 text-xs text-primary">(Commissioner)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {league._count.members}/{league.maxTeams} teams
                    </span>
                    <span>{league.season} season</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Commissioner: {league.commissioner.name}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
