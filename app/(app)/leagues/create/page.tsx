"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

const SCORING_CATEGORIES = [
  { key: "passingTD", label: "Passing TD", default: 4 },
  { key: "passingYards", label: "Passing Yards (per yard)", default: 0.04 },
  { key: "passingINT", label: "Interception Thrown", default: -2 },
  { key: "rushingTD", label: "Rushing TD", default: 6 },
  { key: "rushingYards", label: "Rushing Yards (per yard)", default: 0.1 },
  { key: "receivingTD", label: "Receiving TD", default: 6 },
  { key: "receivingYards", label: "Receiving Yards (per yard)", default: 0.1 },
  { key: "receptions", label: "Reception (PPR)", default: 0 },
  { key: "fumblesLost", label: "Fumble Lost", default: -2 },
  { key: "fg0to39", label: "FG Made 0–39 yds", default: 3 },
  { key: "fg40to49", label: "FG Made 40–49 yds", default: 4 },
  { key: "fg50plus", label: "FG Made 50+ yds", default: 5 },
  { key: "patMade", label: "PAT Made", default: 1 },
  { key: "patMissed", label: "PAT Missed", default: -1 },
  { key: "defSack", label: "DEF Sack", default: 1 },
  { key: "defINT", label: "DEF Interception", default: 2 },
  { key: "defFumbleRecovery", label: "DEF Fumble Recovery", default: 2 },
  { key: "defTD", label: "DEF / ST Touchdown", default: 6 },
  { key: "defSafety", label: "DEF Safety", default: 2 },
  { key: "defPointsAllowed0", label: "DEF 0 Pts Allowed", default: 10 },
  { key: "defPointsAllowed1to6", label: "DEF 1–6 Pts Allowed", default: 7 },
  { key: "defPointsAllowed7to13", label: "DEF 7–13 Pts Allowed", default: 4 },
  { key: "defPointsAllowed14to20", label: "DEF 14–20 Pts Allowed", default: 1 },
  { key: "defPointsAllowed21to27", label: "DEF 21–27 Pts Allowed", default: 0 },
  { key: "defPointsAllowed28plus", label: "DEF 28+ Pts Allowed", default: -4 },
];

const ROSTER_POSITIONS = [
  { key: "QB", label: "Quarterback (QB)", default: 1 },
  { key: "RB", label: "Running Back (RB)", default: 2 },
  { key: "WR", label: "Wide Receiver (WR)", default: 2 },
  { key: "TE", label: "Tight End (TE)", default: 1 },
  { key: "FLEX", label: "Flex (RB/WR/TE)", default: 1 },
  { key: "K", label: "Kicker (K)", default: 1 },
  { key: "DEF", label: "Defense / ST (DEF)", default: 1 },
  { key: "BENCH", label: "Bench", default: 6 },
];

type ScoringMap = Record<string, number>;
type RosterMap = Record<string, number>;

export default function CreateLeaguePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 — Basic Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [season, setSeason] = useState(String(CURRENT_YEAR));
  const [maxTeams, setMaxTeams] = useState("10");
  const [teamName, setTeamName] = useState("");

  // Step 2 — Roster
  const [rosterMap, setRosterMap] = useState<RosterMap>(
    Object.fromEntries(ROSTER_POSITIONS.map((p) => [p.key, p.default]))
  );

  // Step 3 — Scoring
  const [scoringMap, setScoringMap] = useState<ScoringMap>(
    Object.fromEntries(SCORING_CATEGORIES.map((c) => [c.key, c.default]))
  );

  function applyPreset(preset: "standard" | "ppr" | "half-ppr") {
    setScoringMap((prev) => ({
      ...prev,
      receptions: preset === "ppr" ? 1 : preset === "half-ppr" ? 0.5 : 0,
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const scoringRules = Object.entries(scoringMap).map(([statCategory, pointValue]) => ({
      statCategory,
      pointValue,
    }));
    const rosterSlots = Object.entries(rosterMap).map(([position, count]) => ({
      position,
      count,
    }));

    const res = await fetch("/api/leagues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, season, maxTeams, teamName, scoringRules, rosterSlots }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create league.");
      return;
    }

    const league = await res.json();
    router.push(`/leagues/${league.id}`);
  }

  const steps = [
    { n: 1, label: "Basics" },
    { n: 2, label: "Roster" },
    { n: 3, label: "Scoring" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create a League</h1>
        <p className="text-muted-foreground">Set up your college football fantasy league in 3 steps.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step === s.n
                  ? "bg-primary text-white"
                  : step > s.n
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {s.n}
            </div>
            <span className={`text-sm ${step === s.n ? "font-semibold" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-gray-300" />}
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>League Info</CardTitle>
            <CardDescription>Name your league and set the season.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">League Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saturday Morning Slayers"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional league description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season">Season Year *</Label>
                <Input
                  id="season"
                  type="number"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  min={2020}
                  max={2035}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTeams">Max Teams *</Label>
                <Input
                  id="maxTeams"
                  type="number"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(e.target.value)}
                  min={2}
                  max={32}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamName">Your Team Name *</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Iron Bowl Ballers"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Roster Configuration */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Roster Settings</CardTitle>
            <CardDescription>Set how many starters and bench spots each team gets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {ROSTER_POSITIONS.map((pos) => (
                <div key={pos.key} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{pos.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setRosterMap((prev) => ({
                          ...prev,
                          [pos.key]: Math.max(0, (prev[pos.key] ?? 0) - 1),
                        }))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border text-lg hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold">{rosterMap[pos.key]}</span>
                    <button
                      onClick={() =>
                        setRosterMap((prev) => ({
                          ...prev,
                          [pos.key]: (prev[pos.key] ?? 0) + 1,
                        }))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border text-lg hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Total roster size:{" "}
              <strong>{Object.values(rosterMap).reduce((a, b) => a + b, 0)}</strong> spots
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Scoring Rules */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Scoring Rules</CardTitle>
            <CardDescription>Customize point values for every stat category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground mr-1">Presets:</span>
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
            <div className="divide-y max-h-[400px] overflow-y-auto pr-2">
              {SCORING_CATEGORIES.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between py-2.5">
                  <label htmlFor={cat.key} className="text-sm">{cat.label}</label>
                  <Input
                    id={cat.key}
                    type="number"
                    step="0.25"
                    value={scoringMap[cat.key]}
                    onChange={(e) =>
                      setScoringMap((prev) => ({
                        ...prev,
                        [cat.key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-24 text-right"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => (step === 1 ? router.push("/dashboard") : setStep(step - 1))}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {step === 1 ? "Cancel" : "Back"}
        </Button>
        {step < 3 ? (
          <Button
            onClick={() => {
              if (step === 1 && (!name || !teamName || !season)) {
                setError("Please fill in all required fields.");
                return;
              }
              setError("");
              setStep(step + 1);
            }}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating…" : "Create League"}
          </Button>
        )}
      </div>
    </div>
  );
}
