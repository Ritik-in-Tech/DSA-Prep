import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { syncCodeforcesUser } from "@/server/sync/codeforces";
import { syncLeetCodeUser } from "@/server/sync/leetcode";
import { recomputeLeaderboardSnapshot } from "@/server/services/leaderboard";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.CRON_SECRET}`;
  return header === expected;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const verified = await prisma.platformHandle.findMany({
    where: { verifiedAt: { not: null } },
    include: { user: { select: { id: true, timezone: true } } },
  });

  let cfCount = 0;
  let lcCount = 0;
  const errors: { handle: string; platform: string; error: string }[] = [];

  for (const ph of verified) {
    try {
      if (ph.platform === "CODEFORCES") {
        const { inserted } = await syncCodeforcesUser({
          userId: ph.userId,
          handle: ph.handle,
          timezone: ph.user.timezone,
          fromSeconds: ph.lastSyncedAt ? Math.floor(ph.lastSyncedAt.getTime() / 1000) : undefined,
        });
        cfCount += inserted;
      } else {
        const { inserted } = await syncLeetCodeUser({
          userId: ph.userId,
          username: ph.handle,
          timezone: ph.user.timezone,
        });
        lcCount += inserted;
      }
    } catch (err) {
      errors.push({
        handle: ph.handle,
        platform: ph.platform,
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  await recomputeLeaderboardSnapshot();

  return NextResponse.json({
    ok: true,
    cfInserted: cfCount,
    lcInserted: lcCount,
    errors,
    at: new Date().toISOString(),
  });
}
