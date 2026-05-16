import { prisma } from "@/lib/db";
import { Prisma, type Difficulty, type Platform } from "@prisma/client";

export interface ListProblemsArgs {
  platform: Platform;
  page?: number;
  pageSize?: number;
  search?: string;
  difficulties?: Difficulty[];
  ratingMin?: number;
  ratingMax?: number;
  topicSlugs?: string[];
  solvedStatus?: "ALL" | "SOLVED" | "UNSOLVED";
  userId?: string | null;
}

export async function listProblems(args: ListProblemsArgs) {
  const {
    platform,
    page = 1,
    pageSize = 25,
    search,
    difficulties,
    ratingMin,
    ratingMax,
    topicSlugs,
    solvedStatus = "ALL",
    userId = null,
  } = args;

  const where: Prisma.ProblemWhereInput = {
    platform,
  };

  if (search && search.trim().length > 0) {
    where.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { slug: { contains: search.trim().toLowerCase() } },
      { externalId: { contains: search.trim() } },
    ];
  }
  if (difficulties && difficulties.length > 0) {
    where.difficulty = { in: difficulties };
  }
  if (ratingMin != null || ratingMax != null) {
    where.rating = {
      gte: ratingMin,
      lte: ratingMax,
    };
  }
  if (topicSlugs && topicSlugs.length > 0) {
    where.topics = {
      some: { topic: { slug: { in: topicSlugs } } },
    };
  }
  if (solvedStatus !== "ALL" && userId) {
    if (solvedStatus === "SOLVED") {
      where.submissions = { some: { userId, verdict: "AC" } };
    } else {
      where.submissions = { none: { userId, verdict: "AC" } };
    }
  }

  const [total, items] = await Promise.all([
    prisma.problem.count({ where }),
    prisma.problem.findMany({
      where,
      include: {
        topics: { include: { topic: true } },
      },
      orderBy:
        platform === "CODEFORCES" ? [{ rating: "asc" }, { title: "asc" }] : [{ externalId: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  let solvedSet = new Set<string>();
  if (userId && items.length > 0) {
    const solved = await prisma.submission.findMany({
      where: {
        userId,
        verdict: "AC",
        problemId: { in: items.map((i) => i.id) },
      },
      select: { problemId: true },
    });
    solvedSet = new Set(solved.map((s) => s.problemId));
  }

  return {
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    items: items.map((it) => ({
      ...it,
      isSolved: solvedSet.has(it.id),
    })),
  };
}

export async function listTopicsByPlatform(platform: Platform) {
  const topics = await prisma.topic.findMany({
    where: { problems: { some: { problem: { platform } } } },
    orderBy: { name: "asc" },
  });
  return topics;
}
