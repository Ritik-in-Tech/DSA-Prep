import { prisma } from "@/lib/db";

export async function listSheetsWithProgress(userId: string | null) {
  const sheets = await prisma.sheet.findMany({
    include: {
      _count: { select: { problems: true } },
    },
    orderBy: { name: "asc" },
  });

  if (!userId) {
    return sheets.map((s) => ({
      ...s,
      solvedCount: 0,
      totalProblems: s._count.problems,
    }));
  }

  const result = await Promise.all(
    sheets.map(async (s) => {
      const solvedCount = await prisma.sheetProblem.count({
        where: {
          sheetId: s.id,
          problem: {
            submissions: { some: { userId, verdict: "AC" } },
          },
        },
      });
      return {
        ...s,
        solvedCount,
        totalProblems: s._count.problems,
      };
    }),
  );
  return result;
}

export async function getSheetWithSections(slug: string, userId: string | null) {
  const sheet = await prisma.sheet.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          problems: {
            orderBy: { order: "asc" },
            include: {
              problem: {
                include: { topics: { include: { topic: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!sheet) return null;

  let solvedSet = new Set<string>();
  if (userId) {
    const allProblemIds = sheet.sections
      .flatMap((sec) => sec.problems.map((sp) => sp.problem.id))
      .filter(Boolean);
    if (allProblemIds.length > 0) {
      const subs = await prisma.submission.findMany({
        where: {
          userId,
          verdict: "AC",
          problemId: { in: allProblemIds },
        },
        select: { problemId: true },
      });
      solvedSet = new Set(subs.map((s) => s.problemId));
    }
  }

  const sectionsWithProgress = sheet.sections.map((sec) => {
    const total = sec.problems.length;
    const solved = sec.problems.filter((sp) => solvedSet.has(sp.problem.id)).length;
    return {
      ...sec,
      total,
      solved,
      problems: sec.problems.map((sp) => ({
        ...sp,
        isSolved: solvedSet.has(sp.problem.id),
      })),
    };
  });

  const total = sectionsWithProgress.reduce((acc, s) => acc + s.total, 0);
  const solved = sectionsWithProgress.reduce((acc, s) => acc + s.solved, 0);

  return { ...sheet, sections: sectionsWithProgress, total, solved };
}
