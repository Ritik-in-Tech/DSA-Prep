import { prisma } from "@/lib/db";
import { STRIVER_SDE_SHEET } from "./data/striver-sde-sheet";
import { NEETCODE_150 } from "./data/neetcode-150";
import { seedSheet } from "./lib/seed-sheet";

async function main() {
  const t0 = Date.now();
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
  console.log(`[seed-sheets] done in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
