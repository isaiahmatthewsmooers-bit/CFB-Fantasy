"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RosterSlot {
  id: string;
  position: string;
  count: number;
}

const POSITION_LABELS: Record<string, string> = {
  QB: "Quarterback (QB)",
  RB: "Running Back (RB)",
  WR: "Wide Receiver (WR)",
  TE: "Tight End (TE)",
  FLEX: "Flex (RB/WR/TE)",
  K: "Kicker (K)",
  DEF: "Defense / ST (DEF)",
  BENCH: "Bench",
};

const POSITION_ORDER = ["QB", "RB", "WR", "TE", "FLEX", "K", "DEF", "BENCH"];

export function RosterSettingsForm({
  leagueId,
  initialSlots,
}: {
  leagueId: string;
  initialSlots: RosterSlot[];
}) {
  const [slots, setSlots] = useState<Record<string, number>>(
    Object.fromEntries(initialSlots.map((s) => [s.position, s.count]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function adjust(pos: string, delta: number) {
    setSlots((prev) => ({
      ...prev,
      [pos]: Math.max(0, (prev[pos] ?? 0) + delta),
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = Object.entries(slots).map(([position, count]) => ({ position, count }));

    const res = await fetch(`/api/leagues/${leagueId}/roster`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess("Roster settings saved.");
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save.");
    }
  }

  const sortedPositions = POSITION_ORDER.filter((p) => p in slots);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roster Settings</CardTitle>
        <CardDescription>Set how many starters and bench spots per team.</CardDescription>
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

          <div className="divide-y">
            {sortedPositions.map((pos) => (
              <div key={pos} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">{POSITION_LABELS[pos] ?? pos}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjust(pos, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border text-lg hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold">{slots[pos] ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => adjust(pos, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border text-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Total roster:{" "}
            <strong>{Object.values(slots).reduce((a, b) => a + b, 0)}</strong> spots
          </p>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save Roster Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
