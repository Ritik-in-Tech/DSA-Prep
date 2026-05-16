import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Platform } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatInTimezone } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = { title: "Contests — DSA Prep" };

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

function gcalLink(name: string, startsAt: Date, durationMin: number, url: string) {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/-/g, "")
      .replace(/:/g, "")
      .replace(/\.\d{3}/, "");
  const end = new Date(startsAt.getTime() + durationMin * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: name,
    dates: `${fmt(startsAt)}/${fmt(end)}`,
    details: url,
    location: url,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function ContestsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const sp = await searchParams;
  const platform: Platform | null =
    sp.platform === "LEETCODE" ? "LEETCODE" : sp.platform === "CODEFORCES" ? "CODEFORCES" : null;
  const now = new Date();

  const baseWhere: { platform?: Platform } = platform ? { platform } : {};

  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { timezone: true },
      })
    : null;
  const tz = user?.timezone ?? "UTC";

  const [upcoming, past] = await Promise.all([
    prisma.contest.findMany({
      where: { ...baseWhere, startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 50,
    }),
    prisma.contest.findMany({
      where: { ...baseWhere, startsAt: { lt: now } },
      orderBy: { startsAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contests</h1>
        <p className="text-muted-foreground text-sm">
          Upcoming Codeforces and LeetCode contests. Times shown in{" "}
          <span className="text-foreground font-medium">{tz}</span>{" "}
          <Link href="/profile/settings" className="underline-offset-4 hover:underline">
            (change)
          </Link>
          .
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.length === 0 && (
            <Card>
              <CardContent className="text-muted-foreground p-6 text-sm">
                No upcoming contests. Run the cron job to refresh the contest list.
              </CardContent>
            </Card>
          )}
          {upcoming.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="mr-2 font-normal">
                        {c.platform}
                      </Badge>
                      <time dateTime={c.startsAt.toISOString()}>
                        {formatInTimezone(c.startsAt, tz)}
                      </time>{" "}
                      · {formatDuration(c.durationMin)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={gcalLink(c.name, c.startsAt, c.durationMin, c.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-accent inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs"
                    >
                      Add to Google Calendar
                    </a>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-accent inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="past" className="space-y-3">
          {past.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="mr-2 font-normal">
                        {c.platform}
                      </Badge>
                      <time dateTime={c.startsAt.toISOString()}>
                        {formatInTimezone(c.startsAt, tz)}
                      </time>{" "}
                      · {formatDuration(c.durationMin)}
                    </CardDescription>
                  </div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:bg-accent inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs"
                  >
                    Standings <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
