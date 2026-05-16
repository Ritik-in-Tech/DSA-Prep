import { prisma } from "@/lib/db";
import {
  cfExternalId,
  cfProblemUrl,
  getContestList,
  getProblemset,
  getUserStatus,
  type CfProblem,
  type CfSubmission,
} from "@/lib/codeforces";
import { recordAcSolves } from "@/server/services/streak";
import { chunk, slugify } from "@/lib/utils";

export async function syncCodeforcesCatalog(): Promise<{
  problemsUpserted: number;
}> {
  const { problems } = await getProblemset();
  const programming = problems.filter((p) => p.type === "PROGRAMMING");

  const existing = await prisma.problem.findMany({
    where: { platform: "CODEFORCES" },
    select: { id: true, externalId: true },
  });
  const existingMap = new Map<string, string>(
    existing.map((e: { externalId: string; id: string }) => [e.externalId, e.id]),
  );

  const allTagNames = new Set<string>();
  for (const p of programming) for (const t of p.tags) allTagNames.add(t);

  const existingTopics = await prisma.topic.findMany({
    where: { slug: { in: Array.from(allTagNames).map(slugify) } },
    select: { id: true, slug: true },
  });
  const topicMap = new Map<string, string>(
    existingTopics.map((t: { slug: string; id: string }) => [t.slug, t.id]),
  );

  const newTopics = Array.from(allTagNames)
    .filter((name) => !topicMap.has(slugify(name)))
    .map((name) => ({ name, slug: slugify(name) }));
  if (newTopics.length > 0) {
    await prisma.topic.createMany({ data: newTopics, skipDuplicates: true });
    const fresh = await prisma.topic.findMany({
      where: { slug: { in: newTopics.map((t) => t.slug) } },
      select: { id: true, slug: true },
    });
    for (const t of fresh) topicMap.set(t.slug, t.id);
  }

  type NewProblem = {
    externalId: string;
    cf: CfProblem;
    slug: string;
    url: string;
  };
  const toCreate: NewProblem[] = [];
  const toUpdate: { id: string; cf: CfProblem }[] = [];

  for (const p of programming) {
    const externalId = cfExternalId(p);
    const url = cfProblemUrl(p);
    const slug = `cf-${externalId.toLowerCase()}-${slugify(p.name)}`.slice(0, 120);

    const existingId = existingMap.get(externalId);
    if (existingId) {
      toUpdate.push({ id: existingId, cf: p });
    } else {
      toCreate.push({ externalId, cf: p, slug, url });
    }
  }

  for (const batch of chunk(toCreate, 500)) {
    await prisma.problem.createMany({
      data: batch.map((b) => ({
        platform: "CODEFORCES" as const,
        externalId: b.externalId,
        slug: b.slug,
        title: b.cf.name,
        url: b.url,
        difficulty: "UNKNOWN" as const,
        rating: b.cf.rating ?? null,
        contestId: b.cf.contestId?.toString() ?? null,
      })),
      skipDuplicates: true,
    });
  }

  if (toCreate.length > 0) {
    const fresh = await prisma.problem.findMany({
      where: {
        platform: "CODEFORCES",
        externalId: { in: toCreate.map((p) => p.externalId) },
      },
      select: { id: true, externalId: true },
    });
    for (const f of fresh) existingMap.set(f.externalId, f.id);
  }

  const ptRows: { problemId: string; topicId: string }[] = [];
  for (const p of programming) {
    const externalId = cfExternalId(p);
    const problemId = existingMap.get(externalId);
    if (!problemId) continue;
    for (const tag of p.tags) {
      const topicId = topicMap.get(slugify(tag));
      if (topicId) ptRows.push({ problemId, topicId });
    }
  }
  for (const batch of chunk(ptRows, 1000)) {
    await prisma.problemTopic.createMany({ data: batch, skipDuplicates: true });
  }

  for (const batch of chunk(toUpdate, 50)) {
    await Promise.all(
      batch.map((u) =>
        prisma.problem.update({
          where: { id: u.id },
          data: {
            title: u.cf.name,
            rating: u.cf.rating ?? null,
            contestId: u.cf.contestId?.toString() ?? null,
          },
        }),
      ),
    );
  }

  return { problemsUpserted: toCreate.length + toUpdate.length };
}

export async function syncCodeforcesContests(): Promise<{ upserted: number }> {
  const contests = await getContestList(false);
  const usable = contests.filter((c) => c.startTimeSeconds);

  const existing = await prisma.contest.findMany({
    where: { platform: "CODEFORCES" },
    select: { id: true, externalId: true },
  });
  const existingMap = new Map(existing.map((e) => [e.externalId, e.id]));

  const toCreate = usable.filter((c) => !existingMap.has(String(c.id)));
  const toUpdate = usable.filter((c) => existingMap.has(String(c.id)));

  for (const batch of chunk(toCreate, 500)) {
    await prisma.contest.createMany({
      data: batch.map((c) => ({
        platform: "CODEFORCES" as const,
        externalId: String(c.id),
        name: c.name,
        url: c.websiteUrl ?? `https://codeforces.com/contest/${c.id}`,
        startsAt: new Date(c.startTimeSeconds! * 1000),
        durationMin: Math.round(c.durationSeconds / 60),
      })),
      skipDuplicates: true,
    });
  }

  for (const batch of chunk(toUpdate, 100)) {
    await Promise.all(
      batch.map((c) =>
        prisma.contest.update({
          where: {
            platform_externalId: {
              platform: "CODEFORCES",
              externalId: String(c.id),
            },
          },
          data: {
            name: c.name,
            startsAt: new Date(c.startTimeSeconds! * 1000),
            durationMin: Math.round(c.durationSeconds / 60),
          },
        }),
      ),
    );
  }

  return { upserted: toCreate.length + toUpdate.length };
}

function mapVerdict(v: CfSubmission["verdict"]) {
  switch (v) {
    case "OK":
      return "AC" as const;
    case "WRONG_ANSWER":
    case "PRESENTATION_ERROR":
      return "WA" as const;
    case "TIME_LIMIT_EXCEEDED":
    case "IDLENESS_LIMIT_EXCEEDED":
      return "TLE" as const;
    case "MEMORY_LIMIT_EXCEEDED":
      return "MLE" as const;
    case "RUNTIME_ERROR":
    case "CRASHED":
      return "RE" as const;
    case "COMPILATION_ERROR":
      return "CE" as const;
    default:
      return "OTHER" as const;
  }
}

export async function syncCodeforcesUser(args: {
  userId: string;
  handle: string;
  fromSeconds?: number;
  timezone?: string;
}): Promise<{ inserted: number }> {
  const { userId, handle, fromSeconds, timezone } = args;

  const submissions = await getUserStatus(handle, { from: 1, count: 1000 });

  const filtered = fromSeconds
    ? submissions.filter((s) => s.creationTimeSeconds > fromSeconds)
    : submissions;

  if (filtered.length === 0) {
    await prisma.platformHandle.updateMany({
      where: { userId, platform: "CODEFORCES", handle },
      data: { lastSyncedAt: new Date() },
    });
    return { inserted: 0 };
  }

  const externalIds = Array.from(
    new Set(filtered.map((s) => cfExternalId(s.problem as CfProblem))),
  );
  const problems = await prisma.problem.findMany({
    where: {
      platform: "CODEFORCES",
      externalId: { in: externalIds },
    },
    select: { id: true, externalId: true },
  });
  const problemMap = new Map(problems.map((p) => [p.externalId, p.id]));

  const acDates: Date[] = [];
  const rows = filtered
    .map((s) => {
      const externalId = cfExternalId(s.problem as CfProblem);
      const problemId = problemMap.get(externalId);
      if (!problemId) return null;
      const verdict = mapVerdict(s.verdict);
      const submittedAt = new Date(s.creationTimeSeconds * 1000);
      if (verdict === "AC") acDates.push(submittedAt);
      return {
        userId,
        problemId,
        platform: "CODEFORCES" as const,
        externalId: String(s.id),
        verdict,
        language: s.programmingLanguage,
        submittedAt,
        source: "cf-api",
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  let inserted = 0;
  for (const batch of chunk(rows, 500)) {
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
    where: { userId, platform: "CODEFORCES", handle },
    data: { lastSyncedAt: new Date() },
  });

  return { inserted };
}
