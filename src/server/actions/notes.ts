"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export interface SaveNoteResult {
  ok: boolean;
  message: string;
}

// Caps the per-note markdown payload to ~20k chars (well within DB Text limits)
// to prevent a signed-in user from stuffing the database with huge blobs.
const MAX_NOTE_LENGTH = 20_000;

export async function saveNoteAction(formData: FormData): Promise<SaveNoteResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Not signed in" };

  const problemId = String(formData.get("problemId") ?? "");
  const contentMd = String(formData.get("contentMd") ?? "");

  if (!problemId) return { ok: false, message: "Missing problem" };
  if (contentMd.length > MAX_NOTE_LENGTH) {
    return {
      ok: false,
      message: `Note is too long (max ${MAX_NOTE_LENGTH.toLocaleString()} characters).`,
    };
  }

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

  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  const dateKey = today.toISOString().slice(0, 10);

  // Dedupe per (user, platform, problem, day) so the same problem can only be
  // manually marked solved once per UTC day. Prevents click-spam from inflating
  // submission counts and streaks. The Submission unique key is
  // (userId, platform, externalId), so encoding problem+date into externalId
  // gives us the right grain.
  const created = await prisma.submission.createMany({
    data: [
      {
        userId: session.user.id,
        problemId: problem.id,
        platform: problem.platform,
        externalId: `manual-${problem.id}-${dateKey}`,
        verdict: "AC",
        submittedAt: new Date(),
        source: "manual",
      },
    ],
    skipDuplicates: true,
  });

  if (created.count === 0) {
    return { ok: true, message: "Already marked solved today." };
  }

  await prisma.streakDay.upsert({
    where: {
      userId_date: { userId: session.user.id, date: today },
    },
    create: {
      userId: session.user.id,
      date: today,
      solvedCount: 1,
    },
    update: { solvedCount: { increment: 1 } },
  });

  revalidatePath("/dashboard");
  return { ok: true, message: "Marked solved." };
}
