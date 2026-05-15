"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export interface SaveNoteResult {
  ok: boolean;
  message: string;
}

export async function saveNoteAction(formData: FormData): Promise<SaveNoteResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Not signed in" };

  const problemId = String(formData.get("problemId") ?? "");
  const contentMd = String(formData.get("contentMd") ?? "");

  if (!problemId) return { ok: false, message: "Missing problem" };

  await prisma.note.upsert({
    where: {
      userId_problemId: { userId: session.user.id, problemId },
    },
    create: {
      userId: session.user.id,
      problemId,
      contentMd,
    },
    update: { contentMd },
  });

  revalidatePath(`/problems`);
  return { ok: true, message: "Saved." };
}

export async function markSolvedAction(formData: FormData): Promise<SaveNoteResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Not signed in" };
  const problemId = String(formData.get("problemId") ?? "");
  if (!problemId) return { ok: false, message: "Missing problem" };

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { id: true, platform: true },
  });
  if (!problem) return { ok: false, message: "Problem not found" };

  await prisma.submission.create({
    data: {
      userId: session.user.id,
      problemId: problem.id,
      platform: problem.platform,
      externalId: `manual-${Date.now()}`,
      verdict: "AC",
      submittedAt: new Date(),
      source: "manual",
    },
  });

  await prisma.streakDay.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z"),
      },
    },
    create: {
      userId: session.user.id,
      date: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z"),
      solvedCount: 1,
    },
    update: { solvedCount: { increment: 1 } },
  });

  revalidatePath("/dashboard");
  return { ok: true, message: "Marked solved." };
}
