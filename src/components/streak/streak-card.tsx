import { Flame, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  current: number;
  longest: number;
  todaySolved: number;
  last30Days: { date: string; solvedCount: number }[];
}

function buildHeatmap(days: { date: string; solvedCount: number }[]) {
  const today = new Date();
  const cells: { date: string; solvedCount: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const match = days.find((x) => x.date === key);
    cells.push({ date: key, solvedCount: match?.solvedCount ?? 0 });
  }
  return cells;
}

function intensity(n: number): string {
  if (n === 0) return "bg-muted";
  if (n === 1) return "bg-emerald-500/40";
  if (n === 2) return "bg-emerald-500/60";
  if (n <= 4) return "bg-emerald-500/80";
  return "bg-emerald-500";
}

export function StreakCard({ current, longest, todaySolved, last30Days }: Props) {
  const cells = buildHeatmap(last30Days);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Streak</CardTitle>
          <CardDescription>
            {todaySolved > 0
              ? `Solved ${todaySolved} today — keep it going!`
              : "Solve at least one problem today to extend your streak."}
          </CardDescription>
        </div>
        <Flame
          className={cn(
            "h-6 w-6",
            current > 0 ? "text-orange-500" : "text-muted-foreground"
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-bold">{current}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Current streak
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-lg font-semibold">{longest}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Longest
              </p>
            </div>
          </div>
        </div>
        <div
          className="mt-4 grid gap-1"
          style={{ gridTemplateColumns: "repeat(15, minmax(0,1fr))" }}
        >
          {cells.map((c) => (
            <div
              key={c.date}
              title={`${c.date}: ${c.solvedCount} solved`}
              className={cn("h-3 w-3 rounded-sm", intensity(c.solvedCount))}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
