import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { PlatformHandleForm } from "@/components/settings/platform-handle-form";
import { TimezoneForm } from "@/components/settings/timezone-form";

export const metadata = { title: "Settings — DSA Prep" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?from=/profile/settings");

  const [user, handles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { timezone: true },
    }),
    prisma.platformHandle.findMany({
      where: { userId: session.user.id },
    }),
  ]);

  const lc = handles.find((h) => h.platform === "LEETCODE") ?? null;
  const cf = handles.find((h) => h.platform === "CODEFORCES") ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Connect your LeetCode and Codeforces accounts so we can sync your
          submissions and track streaks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LeetCode</CardTitle>
          <CardDescription>
            We use LeetCode&apos;s public GraphQL to read your recent AC
            submissions. To verify ownership, we&apos;ll ask you to put a
            one-time token in your LeetCode bio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformHandleForm
            platform="LEETCODE"
            handle={lc}
            timezone={user?.timezone ?? "UTC"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Codeforces</CardTitle>
          <CardDescription>
            We use the public Codeforces API. To verify, set your one-time token
            as your Codeforces <em>first name</em> (Settings &rarr; General
            &rarr; First Name), then click Verify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformHandleForm
            platform="CODEFORCES"
            handle={cf}
            timezone={user?.timezone ?? "UTC"}
          />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Your timezone is used for streak calculation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimezoneForm initial={user?.timezone ?? "UTC"} />
        </CardContent>
      </Card>
    </div>
  );
}
