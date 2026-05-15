import { prisma } from "@/lib/db";
import {
  syncCodeforcesCatalog,
  syncCodeforcesContests,
} from "@/server/sync/codeforces";

async function main() {
  const t0 = Date.now();
  console.log("[seed-cf] Codeforces problemset…");
  const cf = await syncCodeforcesCatalog();
  console.log(`[seed-cf]   problems upserted: ${cf.problemsUpserted}`);

  console.log("[seed-cf] Codeforces contests…");
  const cfC = await syncCodeforcesContests();
  console.log(`[seed-cf]   contests upserted: ${cfC.upserted}`);
  console.log(`[seed-cf] done in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
