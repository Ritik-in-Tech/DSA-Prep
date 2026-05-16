import { prisma } from "@/lib/db";
import type { Problem, Topic, ProblemTopic } from "@prisma/client";

type Reco = Problem & { topics: (ProblemTopic & { topic: Topic })[] };

export async function recommendForUser(userId: string): Promise<{
  leetcode: Reco | null;
  codeforces: Reco | null;
}> {
  const solvedProblemIds = (
    await prisma.submission.findMany({
      where: { userId, verdict: "AC" },
      select: { problemId: true },
      distinct: ["problemId"],
    })
  ).map((s) => s.problemId);

  const topicCounts = await prisma.problemTopic.groupBy({
    by: ["topicId"],
    where: { problemId: { in: solvedProblemIds } },
    _count: { topicId: true },
  });
  topicCounts.sort((a, b) => a._count.topicId - b._count.topicId);
  const weakestTopicId = topicCounts[0]?.topicId;

  const leetcode = await prisma.problem.findFirst({
    where: {
      platform: "LEETCODE",
      isPremium: false,
      id: { notIn: solvedProblemIds },
      ...(weakestTopicId ? { topics: { some: { topicId: weakestTopicId } } } : {}),
    },
    include: { topics: { include: { topic: true } } },
    orderBy: { externalId: "asc" },
  });

  const cfHandle = await prisma.platformHandle.findFirst({
    where: { userId, platform: "CODEFORCES", verifiedAt: { not: null } },
    select: { handle: true },
  });

  let ratingTarget = 1200;
  if (cfHandle) {
    const recent = await prisma.submission.findFirst({
      where: { userId, platform: "CODEFORCES", verdict: "AC" },
      orderBy: { submittedAt: "desc" },
      include: { problem: true },
    });
    if (recent?.problem.rating) {
      ratingTarget = recent.problem.rating + 100;
    }
  }

  const codeforces = await prisma.problem.findFirst({
    where: {
      platform: "CODEFORCES",
      id: { notIn: solvedProblemIds },
      rating: { gte: ratingTarget - 100, lte: ratingTarget + 100 },
    },
    include: { topics: { include: { topic: true } } },
    orderBy: { rating: "asc" },
  });

  return { leetcode, codeforces };
}
