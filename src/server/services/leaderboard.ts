import { prisma } from "@/lib/db";

function startOfWeekUtc(d: Date = new Date()): Date {
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
  return monday;
}

// Sum of PlatformHandle.solvedCount across verified handles per user. This is
// the authoritative "distinct problems solved" metric:
//   LC handle.solvedCount comes from submitStatsGlobal.acSubmissionNum.All
//   CF handle.solvedCount comes from COUNT(DISTINCT problemId) on AC submissions
async function getTotalSolvedByUser(): Promise<Map<string, number>> {
  const grouped = await prisma.platformHandle.groupBy({
    by: ["userId"],
    where: { verifiedAt: { not: null }, solvedCount: { not: null } },
    _sum: { solvedCount: true },
  });
  return new Map(grouped.map((g) => [g.userId, g._sum.solvedCount ?? 0]));
}

// Distinct problems with at least one AC submission since `since`, grouped per
// user. Spans both platforms via Submission rows.
async function getWeeklySolvedByUser(since: Date): Promise<Map<string, number>> {
  // groupBy on (userId, problemId) gives us distinct problem solves per user;
  // we then bucket per userId in JS. This avoids a raw SQL fallback while
  // still giving DISTINCT-problem semantics.
  const rows = await prisma.submission.groupBy({
    by: ["userId", "problemId"],
    where: { verdict: "AC", submittedAt: { gte: since } },
    _count: { _all: true },
  });
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.userId, (counts.get(r.userId) ?? 0) + 1);
  return counts;
}

export async function recomputeLeaderboardSnapshot() {
  const weekStart = startOfWeekUtc();

  const [totalMap, weeklyMap] = await Promise.all([
    getTotalSolvedByUser(),
    getWeeklySolvedByUser(weekStart),
  ]);

  const userIds = new Set<string>([...totalMap.keys(), ...weeklyMap.keys()]);
  for (const userId of userIds) {
    const weekly = weeklyMap.get(userId) ?? 0;
    const total = totalMap.get(userId) ?? 0;
    await prisma.leaderboardSnapshot.upsert({
      where: { userId_periodStart: { userId, periodStart: weekStart } },
      create: {
        userId,
        periodStart: weekStart,
        weeklySolved: weekly,
        totalSolved: total,
      },
      update: { weeklySolved: weekly, totalSolved: total },
    });
  }
}

export async function getLeaderboard(period: "weekly" | "all") {
  const week = startOfWeekUtc();

  if (period === "weekly") {
    const snaps = await prisma.leaderboardSnapshot.findMany({
      where: { periodStart: week, weeklySolved: { gt: 0 } },
      orderBy: { weeklySolved: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    });
    return snaps.map((s) => ({
      user: s.user,
      score: s.weeklySolved,
      label: "this week",
    }));
  }

  // All-time: rank directly off PlatformHandle.solvedCount so we don't depend
  // on snapshot freshness.
  const grouped = await prisma.platformHandle.groupBy({
    by: ["userId"],
    where: { verifiedAt: { not: null }, solvedCount: { not: null } },
    _sum: { solvedCount: true },
    orderBy: { _sum: { solvedCount: "desc" } },
    take: 50,
  });
  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, name: true, username: true, image: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));
  return grouped
    .map((g) => ({
      user: userMap.get(g.userId)!,
      score: g._sum.solvedCount ?? 0,
      label: "all-time",
    }))
    .filter((r) => r.user && r.score > 0);
}

export interface UserLeaderboardStats {
  rank: number | null;
  totalSolved: number;
  weeklySolved: number;
  totalSubmissions: number;
  byPlatform: { platform: "LEETCODE" | "CODEFORCES"; solved: number }[];
}

export async function getUserLeaderboardStats(userId: string): Promise<UserLeaderboardStats> {
  const week = startOfWeekUtc();

  const [handles, weeklyRows, totalSubmissions] = await Promise.all([
    prisma.platformHandle.findMany({
      where: { userId, verifiedAt: { not: null } },
      select: { platform: true, solvedCount: true },
    }),
    prisma.submission.groupBy({
      by: ["problemId"],
      where: { userId, verdict: "AC", submittedAt: { gte: week } },
      _count: { _all: true },
    }),
    prisma.submission.count({ where: { userId } }),
  ]);

  const totalSolved = handles.reduce((sum, h) => sum + (h.solvedCount ?? 0), 0);
  const weeklySolved = weeklyRows.length;
  const byPlatform = handles
    .filter((h) => h.solvedCount !== null && h.solvedCount > 0)
    .map((h) => ({ platform: h.platform, solved: h.solvedCount ?? 0 }));

  // Rank = 1 + number of users with strictly higher totalSolved. Computed
  // straight from PlatformHandle to stay consistent with getLeaderboard("all").
  const rankRows = await prisma.platformHandle.groupBy({
    by: ["userId"],
    where: { verifiedAt: { not: null }, solvedCount: { not: null } },
    _sum: { solvedCount: true },
  });
  let ahead = 0;
  let hasMe = false;
  for (const r of rankRows) {
    const sum = r._sum.solvedCount ?? 0;
    if (r.userId === userId) hasMe = true;
    else if (sum > totalSolved) ahead += 1;
  }
  const rank = hasMe || totalSolved > 0 ? ahead + 1 : null;

  return { rank, totalSolved, weeklySolved, totalSubmissions, byPlatform };
}
