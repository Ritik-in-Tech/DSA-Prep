import { prisma } from "@/lib/db";

export interface SeedSheetArgs {
  slug: string;
  name: string;
  source: string;
  description: string;
  sections: { name: string; problems: { title: string; lcSlug: string }[] }[];
}

export async function seedSheet(args: SeedSheetArgs) {
  const sheet = await prisma.sheet.upsert({
    where: { slug: args.slug },
    create: {
      slug: args.slug,
      name: args.name,
      source: args.source,
      description: args.description,
    },
    update: {
      name: args.name,
      source: args.source,
      description: args.description,
    },
  });

  const existingSections = await prisma.sheetSection.findMany({
    where: { sheetId: sheet.id },
  });
  const sectionByName = new Map(existingSections.map((s) => [s.name, s]));

  for (let si = 0; si < args.sections.length; si++) {
    const sec = args.sections[si];
    let section = sectionByName.get(sec.name);
    if (!section) {
      section = await prisma.sheetSection.create({
        data: { sheetId: sheet.id, name: sec.name, order: si },
      });
      sectionByName.set(sec.name, section);
    }
  }

  const allSlugs = args.sections.flatMap((s) =>
    s.problems.map((p) => `lc-${p.lcSlug}`)
  );
  const problems = await prisma.problem.findMany({
    where: { platform: "LEETCODE", slug: { in: allSlugs } },
    select: { id: true, slug: true },
  });
  const problemBySlug = new Map(problems.map((p) => [p.slug, p.id]));

  const existing = await prisma.sheetProblem.findMany({
    where: { sheetId: sheet.id },
    select: { problemId: true },
  });
  const existingProblemIds = new Set(existing.map((e) => e.problemId));

  const newRows: {
    sheetId: string;
    sectionId: string;
    problemId: string;
    order: number;
  }[] = [];
  let missing = 0;

  for (let si = 0; si < args.sections.length; si++) {
    const sec = args.sections[si];
    const section = sectionByName.get(sec.name)!;
    for (let pi = 0; pi < sec.problems.length; pi++) {
      const slug = `lc-${sec.problems[pi].lcSlug}`;
      const problemId = problemBySlug.get(slug);
      if (!problemId) {
        missing += 1;
        continue;
      }
      if (existingProblemIds.has(problemId)) continue;
      newRows.push({
        sheetId: sheet.id,
        sectionId: section.id,
        problemId,
        order: pi,
      });
    }
  }

  if (newRows.length > 0) {
    await prisma.sheetProblem.createMany({
      data: newRows,
      skipDuplicates: true,
    });
  }

  console.log(
    `[seed-sheet] ${args.name}: ${newRows.length} new, ${existingProblemIds.size} already linked, ${missing} missing in LC catalog`
  );
}
