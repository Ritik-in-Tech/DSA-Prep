import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, CalendarClock } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { computeStreak } from "@/server/services/streak";
import { recommendForUser } from "@/server/services/recommendations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StreakCard } from "@/components/streak/streak-card";
import {
  DifficultyBadge,
  RatingBadge,
} from "@/components/problems/difficulty-badge";

export const metadata = { title: "Dashboard — DSA Prep" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?from=/dashboard");

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true, name: true },
  });
  const tz = user?.timezone ?? "UTC";

  const [streak, reco, recent, upcoming, handles] = await Promise.all([
    computeStreak(userId, tz),
    recommendForUser(userId),
    prisma.submission.findMany({
      where: { userId },
      orderBy: { submittedAt: "desc" },
      include: { problem: true },
      take: 8,
    }),
    prisma.contest.findMany({
      where: { startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 4,
    }),
    prisma.platformHandle.findMany({
      where: { userId, verifiedAt: { not: null } },
    }),
  ]);

  const noHandles = handles.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hi {user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Your DSA dashboard. Streak, recommendations, recent activity.
        </p>
      </div>

      {noHandles && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">
                Connect your LeetCode or Codeforces account
              </p>
              <p className="text-xs text-muted-foreground">
                We&apos;ll automatically track your streak, sync solved
                problems, and recommend next problems.
              </p>
            </div>
            <Button asChild>
              <Link href="/profile/settings">Connect</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StreakCard
            current={streak.current}
            longest={streak.longest}
            todaySolved={streak.todaySolved}
            last30Days={streak.last30Days}
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No submissions yet.
              </p>
            )}
            {recent.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge
                    variant={s.verdict === "AC" ? "success" : "outline"}
                    className="text-[10px]"
                  >
                    {s.verdict}
                  </Badge>
                  <Link
                    href={`/problems/${s.platform.toLowerCase()}/${s.problem.slug}`}
                    className="truncate hover:underline"
                  >
                    {s.problem.title}
                  </Link>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {s.submittedAt.toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reco.leetcode && (
          <RecoCard
            kind="LeetCode pick"
            description="Targeting a weak topic of yours."
            problem={reco.leetcode}
          />
        )}
        {reco.codeforces && (
          <RecoCard
            kind="Codeforces pick"
            description="Slightly above your last solved rating."
            problem={reco.codeforces}
            showRating
          />
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Upcoming contests</CardTitle>
          <Link
            href="/contests"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcoming.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing scheduled. Seed contests with the cron job.
            </p>
          )}
          {upcoming.map((c) => (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm hover:bg-accent"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{c.name}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {c.startsAt.toLocaleString()}
              </span>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RecoCard({
  kind,
  description,
  problem,
  showRating,
}: {
  kind: string;
  description: string;
  problem: Awaited<ReturnType<typeof recommendForUser>>["leetcode"];
  showRating?: boolean;
}) {
  if (!problem) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{kind}</CardDescription>
        <CardTitle className="text-base">{problem.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {showRating ? (
            <RatingBadge rating={problem.rating} />
          ) : (
            <DifficultyBadge difficulty={problem.difficulty} />
          )}
          {problem.topics.slice(0, 3).map((t) => (
            <Badge key={t.topicId} variant="secondary" className="font-normal">
              {t.topic.name}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <a href={problem.url} target="_blank" rel="noopener noreferrer">
              Solve <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link
              href={`/problems/${problem.platform.toLowerCase()}/${problem.slug}`}
            >
              Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
