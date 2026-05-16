/**
 * Full seed. Idempotent — safe to re-run. Uses batched createMany so it scales
 * even against remote Postgres (e.g. Neon).
 *
 * Run subsets with the dedicated scripts:
 *   pnpm seed:cf       # Codeforces catalog + contests (~10k problems)
 *   pnpm seed:lc       # LeetCode catalog (~3k problems)
 *   pnpm seed:sheets   # Striver + NeetCode sheets (needs LC seeded first)
 */
import { prisma } from "@/lib/db";
import { syncCodeforcesCatalog, syncCodeforcesContests } from "@/server/sync/codeforces";
import {
  syncLeetCodeCatalog,
  syncLeetCodeContests,
} from "@/server/sync/leetcode";
import { STRIVER_SDE_SHEET } from "./data/striver-sde-sheet";
import { NEETCODE_150 } from "./data/neetcode-150";
import { seedSheet } from "./lib/seed-sheet";

async function main() {
  const t0 = Date.now();

  console.log("[seed] Codeforces catalog…");
  const cf = await syncCodeforcesCatalog();
  console.log(`[seed]   CF problems upserted: ${cf.problemsUpserted}`);

  console.log("[seed] Codeforces contests…");
  const cfC = await syncCodeforcesContests();
  console.log(`[seed]   CF contests upserted: ${cfC.upserted}`);

  console.log("[seed] LeetCode catalog (this is the long one)…");
  const lc = await syncLeetCodeCatalog({ fullSync: true });
  console.log(`[seed]   LC problems upserted: ${lc.problemsUpserted}`);

  console.log("[seed] LeetCode contests…");
  const lcC = await syncLeetCodeContests();
  console.log(`[seed]   LC contests upserted: ${lcC.upserted}`);

  console.log("[seed] Curated sheets…");
  await seedSheet({
    slug: "striver-sde",
    name: "Striver SDE Sheet",
    source: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/",
    description: "Comprehensive interview-prep sheet by Striver.",
    sections: STRIVER_SDE_SHEET,
  });
  await seedSheet({
    slug: "neetcode-150",
    name: "NeetCode 150",
    source: "https://neetcode.io/practice",
    description: "150 problems curated by NeetCode covering every major pattern.",
    sections: NEETCODE_150,
  });

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[seed] done in ${elapsed}s.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
