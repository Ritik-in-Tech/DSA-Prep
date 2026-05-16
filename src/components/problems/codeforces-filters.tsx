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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  topics: Topic[];
  initial: {
    q: string;
    ratingMin: number;
    ratingMax: number;
    topicSlugs: string[];
    solved: "ALL" | "SOLVED" | "UNSOLVED";
  };
}

export function CodeforcesFilters({ topics, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(initial.q);
  const [rating, setRating] = useState<[number, number]>([initial.ratingMin, initial.ratingMax]);
  const [topicSet, setTopicSet] = useState<Set<string>>(new Set(initial.topicSlugs));
  const [solved, setSolved] = useState(initial.solved);

  const apply = () => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (rating[0] > 800) sp.set("rmin", String(rating[0]));
    if (rating[1] < 3500) sp.set("rmax", String(rating[1]));
    if (topicSet.size > 0) sp.set("topics", Array.from(topicSet).join(","));
    if (solved !== "ALL") sp.set("solved", solved === "SOLVED" ? "yes" : "no");
    sp.set("page", "1");
    startTransition(() => router.push(`?${sp.toString()}`));
  };

  const toggleTopic = (slug: string) => {
    const next = new Set(topicSet);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setTopicSet(next);
  };

  const clearAll = () => {
    setQ("");
    setRating([800, 3500]);
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
            placeholder="Search problems by name…"
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

      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Rating range</span>
            <span className="font-mono">
              {rating[0]} — {rating[1]}
            </span>
          </div>
          <Slider
            value={rating}
            onValueChange={(v) => setRating([v[0], v[1]] as [number, number])}
            onValueCommit={apply}
            min={800}
            max={3500}
            step={100}
            minStepsBetweenThumbs={1}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Tags{" "}
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
                <p className="text-muted-foreground p-2 text-sm">No tags yet — seed first.</p>
              ) : (
                topics.map((t) => (
                  <label
                    key={t.id}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-2 py-1"
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
              <Button size="sm" onClick={apply}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Select
          value={solved}
          onValueChange={(v) => {
            setSolved(v as typeof solved);
            setTimeout(apply, 0);
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
