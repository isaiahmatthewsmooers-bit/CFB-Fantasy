"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScoringRule {
  id: string;
  statCategory: string;
  pointValue: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  passingTD: "Passing TD",
  passingYards: "Passing Yards (per yard)",
  passingINT: "Interception Thrown",
  rushingTD: "Rushing TD",
  rushingYards: "Rushing Yards (per yard)",
  receivingTD: "Receiving TD",
  receivingYards: "Receiving Yards (per yard)",
  receptions: "Reception (PPR)",
  fumblesLost: "Fumble Lost",
  fg0to39: "FG Made 0–39 yds",
  fg40to49: "FG Made 40–49 yds",
  fg50plus: "FG Made 50+ yds",
  patMade: "PAT Made",
  patMissed: "PAT Missed",
  defSack: "DEF Sack",
  defINT: "DEF Interception",
  defFumbleRecovery: "DEF Fumble Recovery",
  defTD: "DEF / ST Touchdown",
  defSafety: "DEF Safety",
  defPointsAllowed0: "DEF 0 Pts Allowed",
  defPointsAllowed1to6: "DEF 1–6 Pts Allowed",
  defPointsAllowed7to13: "DEF 7–13 Pts Allowed",
  defPointsAllowed14to20: "DEF 14–20 Pts Allowed",
  defPointsAllowed21to27: "DEF 21–27 Pts Allowed",
  defPointsAllowed28plus: "DEF 28+ Pts Allowed",
};

export function ScoringSettingsForm({
  leagueId,
  initialRules,
}: {
  leagueId: string;
  initialRules: ScoringRule[];
}) {
  const [rules, setRules] = useState<Record<string, number>>(
    Object.fromEntries(initialRules.map((r) => [r.statCategory, r.pointValue]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function applyPreset(preset: "standard" | "ppr" | "half-ppr") {
    setRules((prev) => ({
      ...prev,
      receptions: preset === "ppr" ? 1 : preset === "half-ppr" ? 0.5 : 0,
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = Object.entries(rules).map(([statCategory, pointValue]) => ({
      statCategory,
      pointValue,
    }));

    const res = await fetch(`/api/leagues/${leagueId}/scoring`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess("Scoring rules saved.");
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring Rules</CardTitle>
        <CardDescription>Set point values for every stat category.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground mr-1 self-center">Presets:</span>
            {(["standard", "half-ppr", "ppr"] as const).map((p) => (
              <Badge
                key={p}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => applyPreset(p)}
              >
                {p === "ppr" ? "Full PPR" : p === "half-ppr" ? "Half PPR" : "Standard"}
              </Badge>
            ))}
          </div>

          <div className="divide-y max-h-[450px] overflow-y-auto pr-1">
            {Object.keys(rules).map((cat) => (
              <div key={cat} className="flex items-center justify-between py-2.5">
                <label htmlFor={`scoring-${cat}`} className="text-sm">
                  {CATEGORY_LABELS[cat] ?? cat}
                </label>
                <Input
                  id={`scoring-${cat}`}
                  type="number"
                  step="0.25"
                  value={rules[cat]}
                  onChange={(e) =>
                    setRules((prev) => ({
                      ...prev,
                      [cat]: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-24 text-right"
                />
              </div>
            ))}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save Scoring Rules"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
