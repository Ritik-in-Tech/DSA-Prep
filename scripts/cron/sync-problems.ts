/**
 * Runner-side equivalent of GET /api/cron/sync-problems.
 *
 * Runs sequentially (no Prisma pool contention) and exits non-zero on failure
 * so GitHub Actions surfaces the failure correctly. Invoked from the
 * `External cron` workflow via `pnpm cron:sync-problems`.
 */
import { prisma } from "@/lib/db";
import { syncCodeforcesCatalog, syncCodeforcesContests } from "@/server/sync/codeforces";
import { syncLeetCodeCatalog, syncLeetCodeContests } from "@/server/sync/leetcode";

async function main() {
  const t0 = Date.now();

  console.log("[cron:sync-problems] Codeforces catalog…");
  const cf = await syncCodeforcesCatalog();
  console.log(`[cron:sync-problems]   CF problems upserted: ${cf.problemsUpserted}`);

  console.log("[cron:sync-problems] Codeforces contests…");
  const cfContests = await syncCodeforcesContests();
  console.log(`[cron:sync-problems]   CF contests upserted: ${cfContests.upserted}`);

  console.log("[cron:sync-problems] LeetCode catalog (incremental)…");
  const lc = await syncLeetCodeCatalog({ fullSync: false });
  console.log(
    `[cron:sync-problems]   LC problems upserted: ${lc.problemsUpserted} (pages: ${lc.pages})`,
  );

  console.log("[cron:sync-problems] LeetCode contests…");
  const lcContests = await syncLeetCodeContests();
  console.log(`[cron:sync-problems]   LC contests upserted: ${lcContests.upserted}`);

  const ms = Date.now() - t0;
  console.log(
    JSON.stringify({
      ok: true,
      cf,
      cfContests,
      lc,
      lcContests,
      ms,
      at: new Date().toISOString(),
    }),
  );
}

main()
  .catch((err) => {
    console.error("[cron:sync-problems] failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
