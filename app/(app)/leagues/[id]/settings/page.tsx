import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GeneralSettingsForm } from "./GeneralSettingsForm";
import { ScoringSettingsForm } from "./scoring/ScoringSettingsForm";
import { RosterSettingsForm } from "./roster/RosterSettingsForm";

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { id } = await params;

  const membership = await prisma.leagueMember.findFirst({
    where: { leagueId: id, userId: session.user.id },
  });
  if (!membership || membership.role !== "COMMISSIONER") redirect(`/leagues/${id}`);

  const league = await prisma.league.findUnique({
    where: { id },
    include: { scoringRules: true, rosterSlots: true },
  });
  if (!league) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/leagues/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">League Settings</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
          <TabsTrigger value="scoring" className="flex-1">Scoring</TabsTrigger>
          <TabsTrigger value="roster" className="flex-1">Roster</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <GeneralSettingsForm league={league} />
        </TabsContent>

        <TabsContent value="scoring" className="mt-4">
          <ScoringSettingsForm leagueId={id} initialRules={league.scoringRules} />
        </TabsContent>

        <TabsContent value="roster" className="mt-4">
          <RosterSettingsForm leagueId={id} initialSlots={league.rosterSlots} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
