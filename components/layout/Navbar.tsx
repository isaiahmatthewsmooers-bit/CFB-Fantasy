"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, LayoutDashboard } from "lucide-react";

interface NavbarProps {
  userName?: string;
}

export function Navbar({ userName }: NavbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/signin");
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
            <Trophy className="h-5 w-5" />
            CFB Fantasy
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <LayoutDashboard className="h-4 w-4" />
              My Leagues
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden text-sm text-muted-foreground sm:block">{userName}</span>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
