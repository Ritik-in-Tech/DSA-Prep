import Link from "next/link";
import { Trophy } from "lucide-react";
import { getLeaderboard } from "@/server/services/leaderboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = { title: "Leaderboard — DSA Prep" };

export default async function LeaderboardPage() {
  const [weekly, allTime] = await Promise.all([getLeaderboard("weekly"), getLeaderboard("all")]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground text-sm">Most active solvers across the community.</p>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly">This week</TabsTrigger>
          <TabsTrigger value="all">All-time</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Top this week</CardTitle>
              <CardDescription>Snapshot is refreshed nightly by the cron job.</CardDescription>
            </CardHeader>
            <CardContent>
              <Rows rows={weekly} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All-time</CardTitle>
              <CardDescription>Total AC submissions across LeetCode + Codeforces.</CardDescription>
            </CardHeader>
            <CardContent>
              <Rows rows={allTime} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Rows({ rows }: { rows: Awaited<ReturnType<typeof getLeaderboard>> }) {
  if (rows.length === 0)
    return <p className="text-muted-foreground p-4 text-sm">No data yet — invite some friends!</p>;
  return (
    <ol className="divide-y">
      {rows.map((r, i) => (
        <li key={r.user.id} className="flex items-center gap-3 py-2">
          <span className="text-muted-foreground w-6 text-right font-mono text-sm">{i + 1}</span>
          {i === 0 ? <Trophy className="h-4 w-4 text-amber-500" /> : <span className="h-4 w-4" />}
          <Avatar className="h-7 w-7">
            <AvatarImage src={r.user.image ?? undefined} alt={r.user.name ?? "u"} />
            <AvatarFallback>{(r.user.name ?? "U").slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            {r.user.username ? (
              <Link href={`/profile/${r.user.username}`} className="font-medium hover:underline">
                {r.user.name ?? r.user.username}
              </Link>
            ) : (
              <span className="font-medium">{r.user.name ?? "Anonymous"}</span>
            )}
          </div>
          <span className="font-mono text-sm">{r.score}</span>
        </li>
      ))}
    </ol>
  );
}
