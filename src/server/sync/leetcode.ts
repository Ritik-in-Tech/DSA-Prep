import { prisma } from "@/lib/db";
import {
  getProblemList,
  getRecentAcSubmissions,
  getUpcomingLeetCodeContests,
  getUserStats,
  lcContestUrl,
  lcProblemUrl,
  mapLcDifficulty,
  type LcUserStats,
} from "@/lib/leetcode";
import { sleep, chunk } from "@/lib/utils";
import { recordAcSolves } from "@/server/services/streak";

export async function syncLeetCodeCatalog(
  options: { fullSync?: boolean } = {},
): Promise<{ problemsUpserted: number; pages: number }> {
  const limit = 100;
  let skip = 0;
  let total = Infinity;
  let pages = 0;

  const fetched: Awaited<ReturnType<typeof getProblemList>>["questions"] = [];

  while (skip < total) {
    const page = await getProblemList({ skip, limit });
    total = page.total;
    pages += 1;
    fetched.push(...page.questions);
    skip += limit;
    if (!options.fullSync && pages >= 30) break;
    if (skip < total) await sleep(600);
  }

  if (fetched.length === 0) return { problemsUpserted: 0, pages };

  const existing = await prisma.problem.findMany({
    where: { platform: "LEETCODE" },
    select: { id: true, externalId: true },
  });
  const existingMap = new Map<string, string>(
    existing.map((e: { externalId: string; id: string }) => [e.externalId, e.id]),
  );

  const tagPool = new Map<string, string>();
  for (const q of fetched) {
    for (const t of q.topicTags) tagPool.set(t.slug, t.name);
  }
  const existingTopics = await prisma.topic.findMany({
    where: { slug: { in: Array.from(tagPool.keys()) } },
    select: { id: true, slug: true },
  });
  const topicMap = new Map<string, string>(
    existingTopics.map((t: { slug: string; id: string }) => [t.slug, t.id]),
  );
  const newTopics = Array.from(tagPool.entries())
    .filter(([slug]) => !topicMap.has(slug))
    .map(([slug, name]) => ({ slug, name }));
  if (newTopics.length > 0) {
    await prisma.topic.createMany({ data: newTopics, skipDuplicates: true });
    const fresh = await prisma.topic.findMany({
      where: { slug: { in: newTopics.map((t) => t.slug) } },
      select: { id: true, slug: true },
    });
    for (const t of fresh) topicMap.set(t.slug, t.id);
  }

  const toCreate = fetched.filter((q) => !existingMap.has(q.questionFrontendId));
  const toUpdate = fetched.filter((q) => existingMap.has(q.questionFrontendId));

  for (const batch of chunk(toCreate, 500)) {
    await prisma.problem.createMany({
      data: batch.map((q) => ({
        platform: "LEETCODE" as const,
        externalId: q.questionFrontendId,
        slug: `lc-${q.titleSlug}`.slice(0, 120),
        title: q.title,
        url: lcProblemUrl(q.titleSlug),
        difficulty: mapLcDifficulty(q.difficulty),
        isPremium: q.isPaidOnly,
        metadata: { acRate: q.acRate ?? null, titleSlug: q.titleSlug },
      })),
      skipDuplicates: true,
    });
  }

  if (toCreate.length > 0) {
    const fresh = await prisma.problem.findMany({
      where: {
        platform: "LEETCODE",
        externalId: { in: toCreate.map((q) => q.questionFrontendId) },
      },
      select: { id: true, externalId: true },
    });
    for (const f of fresh) existingMap.set(f.externalId, f.id);
  }

  const ptRows: { problemId: string; topicId: string }[] = [];
  for (const q of fetched) {
    const problemId = existingMap.get(q.questionFrontendId);
    if (!problemId) continue;
    for (const t of q.topicTags) {
      const topicId = topicMap.get(t.slug);
      if (topicId) ptRows.push({ problemId, topicId });
    }
  }
  for (const batch of chunk(ptRows, 1000)) {
    await prisma.problemTopic.createMany({ data: batch, skipDuplicates: true });
  }

  for (const batch of chunk(toUpdate, 50)) {
    await Promise.all(
      batch.map((q) =>
        prisma.problem.update({
          where: { id: existingMap.get(q.questionFrontendId)! },
          data: {
            title: q.title,
            url: lcProblemUrl(q.titleSlug),
            difficulty: mapLcDifficulty(q.difficulty),
            isPremium: q.isPaidOnly,
            metadata: { acRate: q.acRate ?? null, titleSlug: q.titleSlug },
          },
        }),
      ),
    );
  }

  return { problemsUpserted: toCreate.length + toUpdate.length, pages };
}

function pickAcCount(stats: LcUserStats | null, difficulty: string): number | null {
  return stats?.submitStats.acSubmissionNum.find((d) => d.difficulty === difficulty)?.count ?? null;
}

export async function syncLeetCodeUser(args: {
  userId: string;
  username: string;
  timezone?: string;
}): Promise<{ inserted: number; solvedCount: number | null }> {
  const { userId, username, timezone } = args;

  // LeetCode silently clamps `recentAcSubmissionList` (typically ~20 for
  // unauthenticated callers), but asking for more is harmless and lets us
  // capture a few extra entries on accounts where they raise the cap.
  const acs = await getRecentAcSubmissions(username, 100);

  const stats = await getUserStats(username).catch(() => null);
  const solvedCount = pickAcCount(stats, "All");
  const handlePatch = {
    solvedCount,
    solvedEasy: pickAcCount(stats, "Easy"),
    solvedMedium: pickAcCount(stats, "Medium"),
    solvedHard: pickAcCount(stats, "Hard"),
    lastSyncedAt: new Date(),
  };

  if (acs.length === 0) {
    await prisma.platformHandle.updateMany({
      where: { userId, platform: "LEETCODE", handle: username },
      data: handlePatch,
    });
    return { inserted: 0, solvedCount };
  }

  const slugs = acs.map((s) => `lc-${s.titleSlug}`);
  const problems = await prisma.problem.findMany({
    where: { platform: "LEETCODE", slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const problemMap = new Map<string, string>(
    problems.map((p: { slug: string; id: string }) => [p.slug, p.id]),
  );

  const acDates: Date[] = [];
  const rows = acs
    .map((s) => {
      const problemId = problemMap.get(`lc-${s.titleSlug}`);
      if (!problemId) return null;
      const submittedAt = new Date(Number(s.timestamp) * 1000);
      acDates.push(submittedAt);
      return {
        userId,
        problemId,
        platform: "LEETCODE" as const,
        externalId: s.id,
        verdict: "AC" as const,
        language: s.lang,
        submittedAt,
        source: "lc-graphql",
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  let inserted = 0;
  for (const batch of chunk(rows, 100)) {
    const res = await prisma.submission.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += res.count;
  }

  if (acDates.length > 0) {
    await recordAcSolves(userId, acDates, timezone ?? "UTC");
  }

  await prisma.platformHandle.updateMany({
    where: { userId, platform: "LEETCODE", handle: username },
    data: handlePatch,
  });

  return { inserted, solvedCount };
}

export async function verifyLeetCodeBioToken(username: string, token: string): Promise<boolean> {
  const stats = await getUserStats(username);
  if (!stats) return false;
  const bio = stats.aboutMe ?? "";
  return bio.includes(token);
}

export async function syncLeetCodeContests(): Promise<{ upserted: number }> {
  const contests = await getUpcomingLeetCodeContests();
  if (contests.length === 0) return { upserted: 0 };

  const existing = await prisma.contest.findMany({
    where: { platform: "LEETCODE" },
    select: { id: true, externalId: true },
  });
  const existingMap = new Map<string, string>(
    existing.map((e: { externalId: string; id: string }) => [e.externalId, e.id]),
  );

  const toCreate = contests.filter((c) => !existingMap.has(c.titleSlug));
  const toUpdate = contests.filter((c) => existingMap.has(c.titleSlug));

  for (const batch of chunk(toCreate, 100)) {
    await prisma.contest.createMany({
      data: batch.map((c) => ({
        platform: "LEETCODE" as const,
        externalId: c.titleSlug,
        name: c.title,
        url: lcContestUrl(c.titleSlug),
        startsAt: new Date(c.startTime * 1000),
        durationMin: Math.round(c.duration / 60),
      })),
      skipDuplicates: true,
    });
  }

  for (const batch of chunk(toUpdate, 50)) {
    await Promise.all(
      batch.map((c) =>
        prisma.contest.update({
          where: {
            platform_externalId: {
              platform: "LEETCODE",
              externalId: c.titleSlug,
            },
          },
          data: {
            name: c.title,
            startsAt: new Date(c.startTime * 1000),
            durationMin: Math.round(c.duration / 60),
          },
        }),
      ),
    );
  }

  return { upserted: toCreate.length + toUpdate.length };
}
