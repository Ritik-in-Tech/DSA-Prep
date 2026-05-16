import Link from "next/link";
import { Trophy } from "lucide-react";
import { auth } from "@/auth";
import { getLeaderboard, getUserLeaderboardStats } from "@/server/services/leaderboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const metadata = { title: "Leaderboard — DSA Prep" };

export default async function LeaderboardPage() {
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  const [weekly, allTime, myStats] = await Promise.all([
    getLeaderboard("weekly"),
    getLeaderboard("all"),
    currentUserId ? getUserLeaderboardStats(currentUserId) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground text-sm">Most active solvers across the community.</p>
      </div>

      {myStats && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="text-muted-foreground text-xs tracking-wide uppercase">Your stats</p>
              <p className="text-sm font-medium">
                {myStats.rank
                  ? `Ranked #${myStats.rank} all-time`
                  : "Connect a platform handle to appear on the board."}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Stat label="Solved" value={myStats.totalSolved} />
              <Stat label="This week" value={myStats.weeklySolved} />
              <Stat label="Attempts" value={myStats.totalSubmissions} />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="weekly">This week</TabsTrigger>
          <TabsTrigger value="all">All-time</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Top this week</CardTitle>
              <CardDescription>Distinct problems solved since Monday (UTC).</CardDescription>
            </CardHeader>
            <CardContent>
              <Rows
                rows={weekly}
                currentUserId={currentUserId}
                myRow={
                  myStats && currentUserId
                    ? buildSelfRow(currentUserId, myStats.weeklySolved, "this week")
                    : null
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All-time</CardTitle>
              <CardDescription>
                Distinct problems solved across LeetCode + Codeforces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Rows
                rows={allTime}
                currentUserId={currentUserId}
                myRow={
                  myStats && currentUserId
                    ? buildSelfRow(currentUserId, myStats.totalSolved, "all-time")
                    : null
                }
                myRank={myStats?.rank ?? null}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-right">
      <p className="font-mono text-2xl leading-none font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-[10px] tracking-wide uppercase">{label}</p>
    </div>
  );
}

type Row = Awaited<ReturnType<typeof getLeaderboard>>[number];

function buildSelfRow(userId: string, score: number, label: string): Row {
  // Placeholder used when the logged-in user falls outside the top-50. We
  // don't have their full user record here, but we don't need it — the row
  // renderer only reads id/name/username/image, all of which can be filled in
  // via a session-aware fallback inside Rows.
  return {
    user: { id: userId, name: null, username: null, image: null },
    score,
    label,
  } as Row;
}

function Rows({
  rows,
  currentUserId,
  myRow,
  myRank,
}: {
  rows: Row[];
  currentUserId: string | null;
  myRow?: Row | null;
  myRank?: number | null;
}) {
  if (rows.length === 0)
    return <p className="text-muted-foreground p-4 text-sm">No data yet — invite some friends!</p>;

  const inTop = currentUserId ? rows.some((r) => r.user.id === currentUserId) : true;
  const showAppendedSelf = !inTop && myRow && myRow.score > 0;

  return (
    <ol className="divide-y">
      {rows.map((r, i) => (
        <RowItem key={r.user.id} row={r} index={i + 1} isMe={r.user.id === currentUserId} />
      ))}
      {showAppendedSelf && (
        <>
          <li className="text-muted-foreground py-2 text-center text-xs">…</li>
          <RowItem row={myRow!} index={myRank ?? null} isMe />
        </>
      )}
    </ol>
  );
}

function RowItem({ row, index, isMe }: { row: Row; index: number | null; isMe: boolean }) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 py-2",
        isMe && "bg-primary/10 -mx-2 rounded-md px-2 font-medium",
      )}
    >
      <span className="text-muted-foreground w-6 text-right font-mono text-sm">{index ?? "—"}</span>
      {index === 1 ? <Trophy className="h-4 w-4 text-amber-500" /> : <span className="h-4 w-4" />}
      <Avatar className="h-7 w-7">
        <AvatarImage src={row.user.image ?? undefined} alt={row.user.name ?? "u"} />
        <AvatarFallback>{(row.user.name ?? "U").slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        {row.user.username ? (
          <Link href={`/profile/${row.user.username}`} className="hover:underline">
            {row.user.name ?? row.user.username}
          </Link>
        ) : (
          <span>{isMe ? "You" : (row.user.name ?? "Anonymous")}</span>
        )}
      </div>
      <span className="font-mono text-sm">{row.score}</span>
    </li>
  );
}
