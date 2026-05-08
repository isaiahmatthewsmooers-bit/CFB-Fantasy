import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-primary">CFB Fantasy</span>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4 text-center">
        <div className="max-w-3xl">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            College Football Fantasy,{" "}
            <span className="text-primary">Done Right</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Create custom leagues, set your own scoring rules, and compete with
            friends using real college football stats powered by
            CollegeFootballData.com.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Create a League</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            {
              title: "Custom Scoring",
              desc: "Set point values for every stat category — passing TDs, rushing yards, receptions, sacks, and more.",
            },
            {
              title: "Real CFB Stats",
              desc: "Player data powered by CollegeFootballData.com, covering all FBS programs.",
            },
            {
              title: "League Management",
              desc: "Invite commissioners, manage rosters, and customize your league from setup to playoffs.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CFB Fantasy. Stats from{" "}
        <a href="https://collegefootballdata.com" className="underline" target="_blank" rel="noopener noreferrer">
          CollegeFootballData.com
        </a>
        .
      </footer>
    </div>
  );
}
