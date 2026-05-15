import { prisma } from "@/lib/db";

function dayKey(d: Date, timezone = "UTC"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function dayDate(d: Date, timezone = "UTC"): Date {
  const key = dayKey(d, timezone);
  return new Date(`${key}T00:00:00Z`);
}

export async function recordAcSolves(
  userId: string,
  acSubmittedAt: Date[],
  timezone = "UTC"
): Promise<void> {
  if (acSubmittedAt.length === 0) return;
  const buckets = new Map<string, number>();
  for (const d of acSubmittedAt) {
    const key = dayKey(d, timezone);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  for (const [key, count] of buckets) {
    const date = new Date(`${key}T00:00:00Z`);
    await prisma.streakDay.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, solvedCount: count },
      update: { solvedCount: { increment: count } },
    });
  }
}

export interface StreakInfo {
  current: number;
  longest: number;
  todaySolved: number;
  last30Days: { date: string; solvedCount: number }[];
}

export async function computeStreak(
  userId: string,
  timezone = "UTC"
): Promise<StreakInfo> {
  const days = await prisma.streakDay.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 365,
  });

  if (days.length === 0) {
    return { current: 0, longest: 0, todaySolved: 0, last30Days: [] };
  }

  const now = new Date();
  const todayKey = dayKey(now, timezone);
  const yesterdayKey = dayKey(
    new Date(now.getTime() - 24 * 3600 * 1000),
    timezone
  );

  const map = new Map(
    days.map((d) => [dayKey(d.date, "UTC"), d.solvedCount] as const)
  );

  const todaySolved = map.get(todayKey) ?? 0;

  let current = 0;
  let cursor = dayDate(now, timezone);
  const todayHas = (map.get(todayKey) ?? 0) > 0;
  if (!todayHas) {
    if ((map.get(yesterdayKey) ?? 0) > 0) {
      cursor = new Date(cursor.getTime() - 24 * 3600 * 1000);
    } else {
      cursor = new Date(0);
    }
  }

  while (cursor.getTime() > 0) {
    const key = dayKey(cursor, "UTC");
    if ((map.get(key) ?? 0) > 0) {
      current += 1;
      cursor = new Date(cursor.getTime() - 24 * 3600 * 1000);
    } else {
      break;
    }
  }

  let longest = 0;
  let run = 0;
  const sortedAsc = [...days].sort((a, b) => a.date.getTime() - b.date.getTime());
  let prev: Date | null = null;
  for (const d of sortedAsc) {
    if (d.solvedCount <= 0) continue;
    if (!prev) {
      run = 1;
    } else {
      const diff = (d.date.getTime() - prev.getTime()) / (24 * 3600 * 1000);
      if (Math.round(diff) === 1) run += 1;
      else run = 1;
    }
    longest = Math.max(longest, run);
    prev = d.date;
  }

  const last30Days = sortedAsc
    .slice(-30)
    .map((d) => ({ date: dayKey(d.date, "UTC"), solvedCount: d.solvedCount }));

  return { current, longest, todaySolved, last30Days };
}
