import { auth } from "@/auth";
import { listProblems, listTopicsByPlatform } from "@/server/services/problems";
import { CodeforcesFilters } from "@/components/problems/codeforces-filters";
import { ProblemRow } from "@/components/problems/problem-row";
import { Pagination } from "@/components/problems/pagination";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "Codeforces problems — DSA Prep" };

function parseTopics(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(",").filter(Boolean);
}

function num(v: string | string[] | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function CodeforcesProblemsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();

  const page = Math.max(1, Number(sp.page) || 1);
  const search = typeof sp.q === "string" ? sp.q : undefined;
  const topicSlugs = parseTopics(sp.topics);
  const ratingMin = num(sp.rmin) ?? 800;
  const ratingMax = num(sp.rmax) ?? 3500;
  const solvedStatus = sp.solved === "yes" ? "SOLVED" : sp.solved === "no" ? "UNSOLVED" : "ALL";

  const [topics, result] = await Promise.all([
    listTopicsByPlatform("CODEFORCES"),
    listProblems({
      platform: "CODEFORCES",
      page,
      pageSize: 25,
      search,
      ratingMin,
      ratingMax,
      topicSlugs,
      solvedStatus,
      userId: session?.user?.id ?? null,
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Codeforces</h1>
        <p className="text-muted-foreground text-sm">
          Browse problems by rating range and tags. {result.total.toLocaleString()} problems
          indexed.
        </p>
      </div>

      <CodeforcesFilters
        topics={topics}
        initial={{
          q: search ?? "",
          ratingMin,
          ratingMax,
          topicSlugs,
          solved: solvedStatus,
        }}
      />

      {result.items.length === 0 ? (
        <div className="text-muted-foreground rounded-md border p-8 text-center text-sm">
          No problems match these filters.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Tags</TableHead>
                <TableHead className="w-24">Rating</TableHead>
                <TableHead className="w-24 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((p) => (
                <ProblemRow key={p.id} problem={p} showRating />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination page={result.page} pages={result.pages} searchParams={sp} />
    </div>
  );
}
