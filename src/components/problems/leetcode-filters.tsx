"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Topic } from "@prisma/client";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Diff = "EASY" | "MEDIUM" | "HARD";

interface Props {
  topics: Topic[];
  initial: {
    q: string;
    difficulties: Diff[];
    topicSlugs: string[];
    solved: "ALL" | "SOLVED" | "UNSOLVED";
  };
}

export function LeetCodeFilters({ topics, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(initial.q);
  const [diffs, setDiffs] = useState<Set<Diff>>(new Set(initial.difficulties));
  const [topicSet, setTopicSet] = useState<Set<string>>(new Set(initial.topicSlugs));
  const [solved, setSolved] = useState(initial.solved);

  const apply = (patch: Partial<{ q: string; solved: string }> = {}) => {
    const sp = new URLSearchParams();
    const next = { q, solved, ...patch };
    if (next.q) sp.set("q", String(next.q));
    if (diffs.size > 0) sp.set("diff", Array.from(diffs).join(","));
    if (topicSet.size > 0) sp.set("topics", Array.from(topicSet).join(","));
    if (next.solved && next.solved !== "ALL")
      sp.set("solved", next.solved === "SOLVED" ? "yes" : "no");
    sp.set("page", "1");
    startTransition(() => router.push(`?${sp.toString()}`));
  };

  const toggleDiff = (d: Diff) => {
    const next = new Set(diffs);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    setDiffs(next);
  };

  const toggleTopic = (slug: string) => {
    const next = new Set(topicSet);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setTopicSet(next);
  };

  const clearAll = () => {
    setQ("");
    setDiffs(new Set());
    setTopicSet(new Set());
    setSolved("ALL");
    startTransition(() => router.push("?"));
  };

  return (
    <div className="bg-card flex flex-col gap-3 rounded-md border p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search problems by title…"
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={pending}>
          Search
        </Button>
        <Button type="button" variant="ghost" onClick={clearAll}>
          Clear
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {(["EASY", "MEDIUM", "HARD"] as Diff[]).map((d) => (
            <Badge
              key={d}
              variant={diffs.has(d) ? "default" : "outline"}
              onClick={() => {
                toggleDiff(d);
                setTimeout(apply, 0);
              }}
              className="cursor-pointer select-none"
            >
              {d[0] + d.slice(1).toLowerCase()}
            </Badge>
          ))}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Topics{" "}
              {topicSet.size > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {topicSet.size}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <div className="max-h-64 overflow-y-auto p-2">
              {topics.length === 0 ? (
                <p className="text-muted-foreground p-2 text-sm">No topics yet — seed first.</p>
              ) : (
                topics.map((t) => (
                  <label
                    key={t.id}
                    className={cn(
                      "hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-2 py-1",
                    )}
                  >
                    <Checkbox
                      checked={topicSet.has(t.slug)}
                      onCheckedChange={() => toggleTopic(t.slug)}
                    />
                    <span className="text-sm">{t.name}</span>
                  </label>
                ))
              )}
            </div>
            <div className="flex items-center justify-between border-t p-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setTopicSet(new Set())}
              >
                <X className="h-3 w-3" /> Clear
              </Button>
              <Button size="sm" onClick={() => apply()}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Select
          value={solved}
          onValueChange={(v) => {
            setSolved(v as typeof solved);
            apply({ solved: v });
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All problems</SelectItem>
            <SelectItem value="SOLVED">Solved</SelectItem>
            <SelectItem value="UNSOLVED">Unsolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
