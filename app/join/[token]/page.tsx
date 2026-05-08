"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy } from "lucide-react";

export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/join/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName }),
    });

    setLoading(false);
    if (res.ok) {
      const { leagueId } = await res.json();
      router.push(`/leagues/${leagueId}`);
    } else {
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/signin?redirect=/join/${token}`);
        return;
      }
      setError(data.error ?? "Failed to join league.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mb-2 flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            <Trophy className="h-6 w-6" />
            CFB Fantasy
          </Link>
          <CardTitle>You&apos;re Invited!</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join a college football fantasy league. Enter your team
            name to accept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="teamName">Your Team Name</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Crimson Tide Destroyers"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Joining…" : "Join League"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="ml-1 text-primary underline underline-offset-4">
            Sign in first
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
