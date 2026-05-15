import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DifficultyBadge,
  RatingBadge,
} from "@/components/problems/difficulty-badge";
import { NotesEditor } from "@/components/problems/notes-editor";
import { MarkSolvedButton } from "@/components/problems/mark-solved-button";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ platform: string; slug: string }>;
}) {
  const { platform: platformParam, slug } = await params;
  const platform =
    platformParam.toUpperCase() === "LEETCODE"
      ? "LEETCODE"
      : platformParam.toUpperCase() === "CODEFORCES"
        ? "CODEFORCES"
        : null;
  if (!platform) notFound();

  const problem = await prisma.problem.findFirst({
    where: { platform, slug },
    include: { topics: { include: { topic: true } } },
  });
  if (!problem) notFound();

  const session = await auth();

  const [note, submissions] = await Promise.all([
    session?.user?.id
      ? prisma.note.findUnique({
          where: {
            userId_problemId: {
              userId: session.user.id,
              problemId: problem.id,
            },
          },
        })
      : Promise.resolve(null),
    session?.user?.id
      ? prisma.submission.findMany({
          where: { userId: session.user.id, problemId: problem.id },
          orderBy: { submittedAt: "desc" },
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  const isSolved = submissions.some((s) => s.verdict === "AC");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/problems/${platform.toLowerCase()}`}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to {platform === "LEETCODE" ? "LeetCode" : "Codeforces"}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{problem.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wide">
                  {platform === "LEETCODE" ? "LeetCode" : "Codeforces"}
                </span>
                <span className="text-xs">·</span>
                {platform === "LEETCODE" ? (
                  <DifficultyBadge difficulty={problem.difficulty} />
                ) : (
                  <RatingBadge rating={problem.rating} />
                )}
                {isSolved && <Badge variant="success">Solved</Badge>}
                {problem.isPremium && <Badge variant="warning">Premium</Badge>}
              </CardDescription>
              <div className="flex flex-wrap gap-1.5">
                {problem.topics.map((t) => (
                  <Badge key={t.topicId} variant="secondary" className="font-normal">
                    {t.topic.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild size="lg">
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solve on {platform === "LEETCODE" ? "LeetCode" : "Codeforces"}{" "}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              {session?.user && !isSolved && (
                <MarkSolvedButton problemId={problem.id} />
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Your notes</CardTitle>
            <CardDescription>
              Markdown supported. Stored privately on your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session?.user ? (
              <NotesEditor
                problemId={problem.id}
                initial={note?.contentMd ?? ""}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                <Link
                  href="/sign-in"
                  className="underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>{" "}
                to take notes.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your submissions</CardTitle>
            <CardDescription>
              {submissions.length === 0
                ? "No submissions yet."
                : `${submissions.length} attempt${submissions.length === 1 ? "" : "s"} on this problem.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {submissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-md border px-2 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={s.verdict === "AC" ? "success" : "outline"}
                    className="text-[10px]"
                  >
                    {s.verdict}
                  </Badge>
                  <span className="text-muted-foreground">
                    {s.submittedAt.toLocaleDateString()}
                  </span>
                </div>
                {s.language && (
                  <span className="text-muted-foreground">{s.language}</span>
                )}
              </div>
            ))}
            {submissions.length === 0 && session?.user && (
              <p className="text-xs text-muted-foreground">
                Sync your handle in{" "}
                <Link href="/profile/settings" className="underline">
                  settings
                </Link>{" "}
                to see submissions here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <p className="text-xs text-muted-foreground">
        Problem statement and tests are hosted on the original platform. We only
        store metadata and your personal notes.
      </p>
    </div>
  );
}
