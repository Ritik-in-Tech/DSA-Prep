"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getUserInfo } from "@/lib/codeforces";
import {
  syncLeetCodeUser,
  verifyLeetCodeBioToken,
} from "@/server/sync/leetcode";
import { syncCodeforcesUser } from "@/server/sync/codeforces";

const HandleSchema = z.object({
  platform: z.enum(["LEETCODE", "CODEFORCES"]),
  handle: z
    .string()
    .trim()
    .min(2, "Handle must be at least 2 characters")
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, "Only letters, digits, _ and - are allowed"),
});

export interface ActionResult {
  ok: boolean;
  message: string;
  data?: { verifyToken?: string };
}

export async function addHandleAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Not signed in" };

  const parsed = HandleSchema.safeParse({
    platform: formData.get("platform"),
    handle: formData.get("handle"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Invalid input" };
  }

  const verifyToken = `dsapv-${randomBytes(4).toString("hex")}`;

  await prisma.platformHandle.upsert({
    where: {
      userId_platform: {
        userId: session.user.id,
        platform: parsed.data.platform,
      },
    },
    create: {
      userId: session.user.id,
      platform: parsed.data.platform,
      handle: parsed.data.handle,
      verifyToken,
    },
    update: {
      handle: parsed.data.handle,
      verifyToken,
      verifiedAt: null,
    },
  });

  revalidatePath("/profile/settings");
  return {
    ok: true,
    message: `Handle saved. Add the token to your ${parsed.data.platform} profile and verify.`,
    data: { verifyToken },
  };
}

export async function verifyHandleAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Not signed in" };

  const platform = formData.get("platform");
  if (platform !== "LEETCODE" && platform !== "CODEFORCES") {
    return { ok: false, message: "Invalid platform" };
  }

  const ph = await prisma.platformHandle.findUnique({
    where: { userId_platform: { userId: session.user.id, platform } },
  });
  if (!ph) return { ok: false, message: "No handle set yet" };
  if (!ph.verifyToken) return { ok: false, message: "No verification token" };

  try {
    let verified = false;
    if (platform === "CODEFORCES") {
      const info = await getUserInfo([ph.handle]);
      const cfUser = info[0];
      if (cfUser) {
        const blob = `${cfUser.firstName ?? ""} ${cfUser.lastName ?? ""} ${cfUser.organization ?? ""}`;
        if (blob.includes(ph.verifyToken)) verified = true;
      }
    } else {
      verified = await verifyLeetCodeBioToken(ph.handle, ph.verifyToken);
    }

    if (!verified) {
      return {
        ok: false,
        message:
          platform === "CODEFORCES"
            ? "We didn't see the token in your Codeforces First Name yet. Make sure you clicked 'Save Changes' on Codeforces — profile edits can take up to a minute to show up. Try Verify again in a moment."
            : "We didn't see the token in your LeetCode bio yet. Make sure you clicked 'Save' on LeetCode — profile edits can take up to a minute to show up. Try Verify again in a moment.",
      };
    }

    await prisma.platformHandle.update({
      where: { userId_platform: { userId: session.user.id, platform } },
      data: { verifiedAt: new Date(), verifyToken: null },
    });

    if (platform === "CODEFORCES") {
      await syncCodeforcesUser({
        userId: session.user.id,
        handle: ph.handle,
      });
    } else {
      await syncLeetCodeUser({
        userId: session.user.id,
        username: ph.handle,
      });
    }

    revalidatePath("/profile/settings");
    revalidatePath("/dashboard");
    return { ok: true, message: "Verified and synced!" };
  } catch (err) {
    console.error("[verifyHandleAction] failed:", err);
    return {
      ok: false,
      message:
        "Verification failed. Please try again in a moment; if it keeps happening, double-check your handle is correct.",
    };
  }
}

export async function resyncHandleAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Not signed in" };

  const platform = formData.get("platform");
  if (platform !== "LEETCODE" && platform !== "CODEFORCES") {
    return { ok: false, message: "Invalid platform" };
  }

  const ph = await prisma.platformHandle.findUnique({
    where: { userId_platform: { userId: session.user.id, platform } },
  });
  if (!ph?.verifiedAt) {
    return { ok: false, message: "Handle not verified yet" };
  }

  try {
    if (platform === "CODEFORCES") {
      await syncCodeforcesUser({
        userId: session.user.id,
        handle: ph.handle,
      });
    } else {
      await syncLeetCodeUser({
        userId: session.user.id,
        username: ph.handle,
      });
    }
    revalidatePath("/dashboard");
    revalidatePath("/profile/settings");
    return { ok: true, message: "Synced." };
  } catch (err) {
    console.error("[resyncHandleAction] failed:", err);
    return {
      ok: false,
      message: "Sync failed. Please try again in a few minutes.",
    };
  }
}

export async function removeHandleAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Not signed in" };

  const platform = formData.get("platform");
  if (platform !== "LEETCODE" && platform !== "CODEFORCES") {
    return { ok: false, message: "Invalid platform" };
  }

  await prisma.platformHandle
    .delete({
      where: {
        userId_platform: { userId: session.user.id, platform },
      },
    })
    .catch(() => null);

  revalidatePath("/profile/settings");
  return { ok: true, message: "Removed." };
}

export async function setTimezoneAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Not signed in" };
  const tz = String(formData.get("timezone") ?? "UTC");
  await prisma.user.update({
    where: { id: session.user.id },
    data: { timezone: tz },
  });
  revalidatePath("/profile/settings");
  return { ok: true, message: "Timezone updated." };
}
