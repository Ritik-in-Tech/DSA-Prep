import Link from "next/link";
import { Flame, ListTodo, CalendarClock, Trophy, Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" /> One place for DSA prep
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Best DSA prep, organized.
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg text-balance">
            Topic-wise LeetCode, rating-wise Codeforces, curated Striver & NeetCode sheets. Sync
            your accounts, track streaks, beat your longest.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/problems/leetcode">Browse problems</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-20 md:grid-cols-3">
          <Feature
            icon={<ListTodo className="h-5 w-5" />}
            title="Topic + rating filters"
            desc="LeetCode by topic & difficulty. Codeforces by rating band & tag. Find your zone."
          />
          <Feature
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            title="Streaks & sync"
            desc="Connect LeetCode and Codeforces. We pull your AC submissions and keep your streak alive."
          />
          <Feature
            icon={<Trophy className="h-5 w-5 text-amber-500" />}
            title="Sheets + leaderboard"
            desc="Striver SDE Sheet and NeetCode 150 mapped to LeetCode. Compete on the weekly leaderboard."
          />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-xl font-semibold">How &quot;Solve&quot; works</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Every Solve button opens the canonical problem page on LeetCode or Codeforces in a new
              tab. We don&apos;t re-host the problem statement or your code — your work stays on the
              source platforms, and we just track your progress and notes.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="bg-muted rounded px-2 py-1">No re-hosting</span>
              <span className="bg-muted rounded px-2 py-1">Public APIs / GraphQL only</span>
              <span className="bg-muted rounded px-2 py-1">
                <CalendarClock className="mr-1 inline h-3 w-3" />
                Contests calendar
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-muted-foreground border-t py-6 text-center text-xs">
        © {new Date().getFullYear()} DSA Prep ·{" "}
        <a
          href="https://github.com/Ritik-in-Tech/DSA-Prep"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:underline"
        >
          GitHub
        </a>{" "}
        · Built by Ritik
      </footer>

      <Analytics />
      <SpeedInsights />
    </>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="bg-muted mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg">
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{desc}</p>
    </div>
  );
}
