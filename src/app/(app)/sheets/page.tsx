import Link from "next/link";
import { auth } from "@/auth";
import { listSheetsWithProgress } from "@/server/services/sheets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "Sheets — DSA Prep" };

export default async function SheetsPage() {
  const session = await auth();
  const sheets = await listSheetsWithProgress(session?.user?.id ?? null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Curated Sheets</h1>
        <p className="text-muted-foreground text-sm">
          Famous DSA roadmaps mapped to LeetCode problems. Solved status is inferred from your
          synced submissions and any &quot;mark solved&quot; actions.
        </p>
      </div>

      {sheets.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground p-6 text-sm">
            No sheets yet. Run <code className="bg-muted rounded px-1 py-0.5">pnpm db:seed</code>{" "}
            after seeding LeetCode problems.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {sheets.map((s) => {
          const pct =
            s.totalProblems === 0 ? 0 : Math.round((s.solvedCount / s.totalProblems) * 100);
          return (
            <Card key={s.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/sheets/${s.slug}`} className="hover:underline">
                    {s.name}
                  </Link>
                </CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono">
                    {s.solvedCount}/{s.totalProblems} ({pct}%)
                  </span>
                </div>
                <Progress value={pct} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
