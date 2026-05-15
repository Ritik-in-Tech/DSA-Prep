import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { computeStreak } from "@/server/services/streak";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) notFound();

  const [handles, totalAc, byPlatform, byTopic, streak] = await Promise.all([
    prisma.platformHandle.findMany({
      where: { userId: user.id, verifiedAt: { not: null } },
    }),
    prisma.submission.count({
      where: { userId: user.id, verdict: "AC" },
    }),
    prisma.submission.groupBy({
      by: ["platform"],
      where: { userId: user.id, verdict: "AC" },
      _count: { _all: true },
    }),
    prisma.problemTopic.groupBy({
      by: ["topicId"],
      where: {
        problem: {
          submissions: { some: { userId: user.id, verdict: "AC" } },
        },
      },
      _count: { _all: true },
      orderBy: { _count: { topicId: "desc" } },
      take: 12,
    }),
    computeStreak(user.id, user.timezone),
  ]);

  const topicIds = byTopic.map((t) => t.topicId);
  const topics = await prisma.topic.findMany({
    where: { id: { in: topicIds } },
  });
  const topicMap = new Map(topics.map((t) => [t.id, t]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback>
                {(user.name ?? user.username ?? "U").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {user.name ?? user.username}
              </CardTitle>
              <CardDescription>@{user.username}</CardDescription>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {handles.map((h) => (
                  <Badge key={h.id} variant="secondary">
                    {h.platform}: {h.handle}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total AC" value={totalAc} />
        <Stat label="Current streak" value={streak.current} />
        <Stat label="Longest streak" value={streak.longest} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By platform</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {byPlatform.map((p) => (
            <Badge key={p.platform} variant="outline">
              {p.platform}: {p._count._all}
            </Badge>
          ))}
          {byPlatform.length === 0 && (
            <p className="text-sm text-muted-foreground">No solves yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top topics</CardTitle>
          <CardDescription>
            Topics covered by your AC submissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {byTopic.map((t) => {
            const topic = topicMap.get(t.topicId);
            if (!topic) return null;
            return (
              <Badge key={t.topicId} variant="secondary">
                {topic.name} · {t._count._all}
              </Badge>
            );
          })}
          {byTopic.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Solve a few problems to populate this section.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
