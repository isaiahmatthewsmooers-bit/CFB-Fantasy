"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Crown, Mail, Trash2, UserPlus } from "lucide-react";

interface Member {
  id: string;
  teamName: string;
  role: "COMMISSIONER" | "MEMBER";
  joinedAt: string;
  user: { id: string; name: string; email: string };
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  token: string;
}

export default function MembersPage() {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    const membersRes = await fetch(`/api/leagues/${id}/members`);
    if (membersRes.ok) {
      const data: Member[] = await membersRes.json();
      setMembers(data);

      const myMember = data.find((m) =>
        data.some((d) => d.role === "COMMISSIONER" && d.id === m.id)
      );
      const invRes = await fetch(`/api/leagues/${id}/invitations`);
      if (invRes.ok) {
        setInvitations(await invRes.json());
        setIsCommissioner(true);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError("");
    setSuccess("");

    const res = await fetch(`/api/leagues/${id}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });

    setInviting(false);
    if (res.ok) {
      const inv: Invitation = await res.json();
      setInvitations((prev) => [inv, ...prev.filter((i) => i.email !== inv.email)]);
      setInviteEmail("");
      setSuccess(`Invitation sent to ${inviteEmail}`);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to send invitation.");
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Remove this member from the league?")) return;
    const res = await fetch(`/api/leagues/${id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (loading) {
    return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/leagues/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Members</h1>
      </div>

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Teams ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{m.teamName}</p>
                <p className="text-sm text-muted-foreground">
                  {m.user.name} · {m.user.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {m.role === "COMMISSIONER" ? (
                  <Badge variant="outline">
                    <Crown className="mr-1 h-3 w-3" />
                    Commissioner
                  </Badge>
                ) : (
                  isCommissioner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invite Section — commissioner only */}
      {isCommissioner && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4" />
                Invite a Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <form onSubmit={handleInvite} className="flex gap-2">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                />
                <Button type="submit" disabled={inviting}>
                  <Mail className="mr-1 h-4 w-4" />
                  {inviting ? "Sending…" : "Invite"}
                </Button>
              </form>

              {invitations.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Pending Invitations</p>
                  <div className="divide-y rounded-md border">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between px-3 py-2">
                        <div>
                          <p className="text-sm">{inv.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires {new Date(inv.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              inv.status === "ACCEPTED"
                                ? "success"
                                : inv.status === "EXPIRED"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {inv.status}
                          </Badge>
                          {inv.status === "PENDING" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const link = `${origin}/join/${inv.token}`;
                                navigator.clipboard.writeText(link);
                                setSuccess("Invite link copied!");
                              }}
                            >
                              Copy Link
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
