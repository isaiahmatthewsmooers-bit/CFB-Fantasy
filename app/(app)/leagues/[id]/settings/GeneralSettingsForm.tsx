"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface League {
  id: string;
  name: string;
  description: string | null;
  maxTeams: number;
  status: string;
}

export function GeneralSettingsForm({ league }: { league: League }) {
  const router = useRouter();
  const [name, setName] = useState(league.name);
  const [description, setDescription] = useState(league.description ?? "");
  const [maxTeams, setMaxTeams] = useState(String(league.maxTeams));
  const [status, setStatus] = useState(league.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch(`/api/leagues/${league.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, maxTeams, status }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess("Settings saved.");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save settings.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>Update your league&apos;s basic information.</CardDescription>
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
          <div className="space-y-2">
            <Label>League Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Teams</Label>
              <Input
                type="number"
                min={2}
                max={32}
                value={maxTeams}
                onChange={(e) => setMaxTeams(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="SETUP">Setup</option>
                <option value="DRAFTING">Drafting</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
