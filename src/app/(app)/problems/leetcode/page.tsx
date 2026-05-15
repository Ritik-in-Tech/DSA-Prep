import { auth } from "@/auth";
import { listProblems, listTopicsByPlatform } from "@/server/services/problems";
import { LeetCodeFilters } from "@/components/problems/leetcode-filters";
import { ProblemRow } from "@/components/problems/problem-row";
import { Pagination } from "@/components/problems/pagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "LeetCode problems — DSA Prep" };

type Difficulty = "EASY" | "MEDIUM" | "HARD";

function parseDifficulties(v: string | string[] | undefined): Difficulty[] {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : v.split(",");
  return arr.filter((x): x is Difficulty => ["EASY", "MEDIUM", "HARD"].includes(x));
}

function parseTopics(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(",").filter(Boolean);
}

export default async function LeetCodeProblemsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();

  const page = Math.max(1, Number(sp.page) || 1);
  const search = typeof sp.q === "string" ? sp.q : undefined;
  const difficulties = parseDifficulties(sp.diff);
  const topicSlugs = parseTopics(sp.topics);
  const solvedStatus =
    sp.solved === "yes" ? "SOLVED" : sp.solved === "no" ? "UNSOLVED" : "ALL";

  const [topics, result] = await Promise.all([
    listTopicsByPlatform("LEETCODE"),
    listProblems({
      platform: "LEETCODE",
      page,
      pageSize: 25,
      search,
      difficulties,
      topicSlugs,
      solvedStatus,
      userId: session?.user?.id ?? null,
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">LeetCode</h1>
        <p className="text-sm text-muted-foreground">
          Browse problems by topic and difficulty. {result.total.toLocaleString()} problems indexed.
        </p>
      </div>

      <LeetCodeFilters
        topics={topics}
        initial={{
          q: search ?? "",
          difficulties,
          topicSlugs,
          solved: solvedStatus,
        }}
      />

      {result.items.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          No problems match these filters. Try clearing them, or run{" "}
          <code className="rounded bg-muted px-1 py-0.5">pnpm db:seed</code> if the catalog is empty.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Topics</TableHead>
                <TableHead className="w-24">Difficulty</TableHead>
                <TableHead className="w-24 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((p) => (
                <ProblemRow key={p.id} problem={p} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination page={result.page} pages={result.pages} searchParams={sp} />
    </div>
  );
}
