import { CheckCircle2, CalendarRange, ListChecks } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserLeaderboardStats } from "@/server/services/leaderboard";

interface Props {
  stats: UserLeaderboardStats;
}

const PLATFORM_LABEL: Record<UserLeaderboardStats["byPlatform"][number]["platform"], string> = {
  LEETCODE: "LC",
  CODEFORCES: "CF",
};

export function StatsCard({ stats }: Props) {
  const { totalSolved, weeklySolved, totalSubmissions, byPlatform, rank } = stats;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Problems solved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <p className="font-mono text-3xl font-semibold">{totalSolved}</p>
          <CardDescription className="mt-1">
            {rank
              ? `Rank #${rank} \u00b7 distinct problems across LeetCode + Codeforces`
              : "Distinct problems across LeetCode + Codeforces"}
          </CardDescription>
          {byPlatform.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {byPlatform.map((p) => (
                <Badge key={p.platform} variant="secondary" className="font-normal">
                  {PLATFORM_LABEL[p.platform]} · {p.solved}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solved this week</CardTitle>
          <CalendarRange className="h-4 w-4 text-sky-500" />
        </CardHeader>
        <CardContent>
          <p className="font-mono text-3xl font-semibold">{weeklySolved}</p>
          <CardDescription className="mt-1">
            Distinct problems accepted since Monday (UTC).
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tracked attempts</CardTitle>
          <ListChecks className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <p className="font-mono text-3xl font-semibold">{totalSubmissions}</p>
          <CardDescription className="mt-1">
            Submissions logged locally (Codeforces full history; LeetCode recent ACs only).
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
