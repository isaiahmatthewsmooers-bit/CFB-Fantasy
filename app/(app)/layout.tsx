import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={session.user.name ?? undefined} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
