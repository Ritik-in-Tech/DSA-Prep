import { prisma } from "@/lib/db";

function startOfWeekUtc(d: Date = new Date()): Date {
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
  return monday;
}

export async function recomputeLeaderboardSnapshot() {
  const weekStart = startOfWeekUtc();

  const since = new Date(weekStart);
  const weeklyRows = await prisma.submission.groupBy({
    by: ["userId"],
    where: { verdict: "AC", submittedAt: { gte: since } },
    _count: { _all: true },
  });

  const totalRows = await prisma.submission.groupBy({
    by: ["userId"],
    where: { verdict: "AC" },
    _count: { _all: true },
  });
  const totalMap = new Map(totalRows.map((r) => [r.userId, r._count._all]));

  const userIds = new Set<string>([
    ...weeklyRows.map((r) => r.userId),
    ...totalRows.map((r) => r.userId),
  ]);

  for (const userId of userIds) {
    const weekly = weeklyRows.find((r) => r.userId === userId)?._count._all ?? 0;
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
  if (period === "weekly") {
    const week = startOfWeekUtc();
    const snaps = await prisma.leaderboardSnapshot.findMany({
      where: { periodStart: week },
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

  const rows = await prisma.submission.groupBy({
    by: ["userId"],
    where: { verdict: "AC" },
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
    take: 50,
  });
  const users = await prisma.user.findMany({
    where: { id: { in: rows.map((r) => r.userId) } },
    select: { id: true, name: true, username: true, image: true },
  });
  const map = new Map(users.map((u) => [u.id, u]));
  return rows
    .map((r) => ({
      user: map.get(r.userId)!,
      score: r._count._all,
      label: "all-time",
    }))
    .filter((r) => r.user);
}
