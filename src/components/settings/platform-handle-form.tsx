"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { PlatformHandle } from "@prisma/client";
import { Check, Copy, RotateCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  addHandleAction,
  removeHandleAction,
  resyncHandleAction,
  verifyHandleAction,
} from "@/server/actions/handles";

interface Props {
  platform: "LEETCODE" | "CODEFORCES";
  handle: PlatformHandle | null;
}

export function PlatformHandleForm({ platform, handle }: Props) {
  const [pending, startTransition] = useTransition();
  const [verifyToken, setVerifyToken] = useState<string | null>(
    handle?.verifyToken ?? null
  );
  const [input, setInput] = useState(handle?.handle ?? "");

  const verified = Boolean(handle?.verifiedAt);
  const hasUnverified = Boolean(handle && !handle.verifiedAt);

  const onAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addHandleAction(form);
      if (res.ok) {
        toast.success(res.message);
        setVerifyToken(res.data?.verifyToken ?? null);
      } else toast.error(res.message);
    });
  };

  const onVerify = () => {
    const form = new FormData();
    form.set("platform", platform);
    startTransition(async () => {
      const res = await verifyHandleAction(form);
      if (res.ok) {
        toast.success(res.message);
        setVerifyToken(null);
      } else toast.error(res.message);
    });
  };

  const onResync = () => {
    const form = new FormData();
    form.set("platform", platform);
    startTransition(async () => {
      const res = await resyncHandleAction(form);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  const onRemove = () => {
    const form = new FormData();
    form.set("platform", platform);
    startTransition(async () => {
      const res = await removeHandleAction(form);
      if (res.ok) {
        toast.success(res.message);
        setInput("");
        setVerifyToken(null);
      } else toast.error(res.message);
    });
  };

  const fieldName = platform === "CODEFORCES" ? "First Name" : "About me / bio";

  return (
    <div className="space-y-4">
      <form onSubmit={onAdd} className="flex items-end gap-3">
        <input type="hidden" name="platform" value={platform} />
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`${platform}-handle`}>Username</Label>
          <Input
            id={`${platform}-handle`}
            name="handle"
            placeholder={
              platform === "LEETCODE" ? "your_lc_username" : "your_cf_handle"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {handle ? "Update" : "Save"}
        </Button>
      </form>

      {verified && (
        <div className="flex items-center justify-between rounded-md border bg-card p-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" /> Verified
            </Badge>
            <span className="text-muted-foreground">
              Last synced{" "}
              {handle?.lastSyncedAt
                ? new Date(handle.lastSyncedAt).toLocaleString()
                : "never"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onResync}
              disabled={pending}
            >
              <RotateCw className="h-3.5 w-3.5" /> Sync now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              disabled={pending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {hasUnverified && verifyToken && (
        <div className="space-y-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
          <p className="font-medium">Verification required</p>
          <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
            <li>
              Copy the token below and paste it into your <b>{fieldName}</b>{" "}
              on{" "}
              <a
                href={
                  platform === "CODEFORCES"
                    ? "https://codeforces.com/settings/social"
                    : "https://leetcode.com/profile/"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {platform === "CODEFORCES"
                  ? "codeforces.com"
                  : "leetcode.com"}
              </a>
              .
            </li>
            <li>Save the change on the platform.</li>
            <li>Click &quot;Verify&quot; below.</li>
          </ol>
          <div className="flex items-center gap-2 rounded bg-background px-2 py-1 font-mono text-xs">
            <code className="flex-1">{verifyToken}</code>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(verifyToken);
                toast.success("Copied!");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={onVerify} disabled={pending}>
              Verify
            </Button>
            <Button size="sm" variant="ghost" onClick={onRemove} disabled={pending}>
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            After we verify, you can remove the token from your profile if you
            like.
          </p>
        </div>
      )}
    </div>
  );
}
