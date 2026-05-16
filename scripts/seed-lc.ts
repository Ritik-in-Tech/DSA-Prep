import { prisma } from "@/lib/db";
import {
  syncLeetCodeCatalog,
  syncLeetCodeContests,
} from "@/server/sync/leetcode";

async function main() {
  const t0 = Date.now();
  console.log("[seed-lc] LeetCode catalog (full)…");
  const lc = await syncLeetCodeCatalog({ fullSync: true });
  console.log(`[seed-lc]   problems upserted: ${lc.problemsUpserted}`);
  console.log("[seed-lc] LeetCode contests…");
  const lcC = await syncLeetCodeContests();
  console.log(`[seed-lc]   contests upserted: ${lcC.upserted}`);
  console.log(`[seed-lc] done in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
