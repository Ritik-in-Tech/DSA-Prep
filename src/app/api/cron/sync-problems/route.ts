import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  syncCodeforcesCatalog,
  syncCodeforcesContests,
} from "@/server/sync/codeforces";
import { syncLeetCodeCatalog } from "@/server/sync/leetcode";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.CRON_SECRET}`;
  return header === expected;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const [cf, contests, lc] = await Promise.all([
      syncCodeforcesCatalog(),
      syncCodeforcesContests(),
      syncLeetCodeCatalog({ fullSync: false }),
    ]);
    return NextResponse.json({
      ok: true,
      cf,
      contests,
      lc,
      at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "failed" },
      { status: 500 }
    );
  }
}
