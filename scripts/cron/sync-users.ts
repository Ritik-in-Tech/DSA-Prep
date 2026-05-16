/**
 * Runner-side equivalent of GET /api/cron/sync-users.
 *
 * Iterates every verified PlatformHandle, syncs the corresponding submissions,
 * then recomputes the leaderboard snapshot. Per-handle failures are collected
 * (matching the API route's behaviour) and the script exits 0 on partial
 * success — but exits non-zero on any top-level / leaderboard failure so the
 * GitHub Actions run shows red.
 */
import { prisma } from "@/lib/db";
import { syncCodeforcesUser } from "@/server/sync/codeforces";
import { syncLeetCodeUser } from "@/server/sync/leetcode";
import { recomputeLeaderboardSnapshot } from "@/server/services/leaderboard";

type HandleError = { handle: string; platform: string; error: string };

async function main() {
  const t0 = Date.now();

  const verified = await prisma.platformHandle.findMany({
    where: { verifiedAt: { not: null } },
    include: { user: { select: { id: true, timezone: true } } },
  });

  console.log(`[cron:sync-users] verified handles: ${verified.length}`);

  let cfInserted = 0;
  let lcInserted = 0;
  const errors: HandleError[] = [];

  for (const ph of verified) {
    try {
      if (ph.platform === "CODEFORCES") {
        const { inserted } = await syncCodeforcesUser({
          userId: ph.userId,
          handle: ph.handle,
          timezone: ph.user.timezone,
          fromSeconds: ph.lastSyncedAt ? Math.floor(ph.lastSyncedAt.getTime() / 1000) : undefined,
        });
        cfInserted += inserted;
      } else {
        const { inserted } = await syncLeetCodeUser({
          userId: ph.userId,
          username: ph.handle,
          timezone: ph.user.timezone,
        });
        lcInserted += inserted;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown";
      errors.push({ handle: ph.handle, platform: ph.platform, error: message });
      console.error(`[cron:sync-users]   ${ph.platform} ${ph.handle} failed: ${message}`);
    }
  }

  console.log("[cron:sync-users] recomputing leaderboard snapshot…");
  await recomputeLeaderboardSnapshot();

  const ms = Date.now() - t0;
  console.log(
    JSON.stringify({
      ok: true,
      verified: verified.length,
      cfInserted,
      lcInserted,
      errors,
      ms,
      at: new Date().toISOString(),
    }),
  );
}

main()
  .catch((err) => {
    console.error("[cron:sync-users] failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
