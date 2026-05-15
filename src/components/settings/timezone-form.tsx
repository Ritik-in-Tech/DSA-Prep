"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setTimezoneAction } from "@/server/actions/handles";

const COMMON_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function TimezoneForm({ initial }: { initial: string }) {
  const [tz, setTz] = useState(initial);
  const [pending, startTransition] = useTransition();

  const onSave = () => {
    const form = new FormData();
    form.set("timezone", tz);
    startTransition(async () => {
      const res = await setTimezoneAction(form);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="timezone">Timezone</Label>
        <Select value={tz} onValueChange={setTz}>
          <SelectTrigger id="timezone" className="w-full">
            <SelectValue placeholder="Pick a timezone" />
          </SelectTrigger>
          <SelectContent>
            {COMMON_TIMEZONES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onSave} disabled={pending}>
        Save
      </Button>
    </div>
  );
}
