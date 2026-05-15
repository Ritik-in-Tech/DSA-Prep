import { cn } from "@/lib/utils";
import type { Difficulty } from "@prisma/client";

const STYLES: Record<Difficulty, string> = {
  EASY: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  MEDIUM: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  HARD: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  UNKNOWN: "bg-muted text-muted-foreground",
};

const LABEL: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  UNKNOWN: "—",
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        STYLES[difficulty],
        className
      )}
    >
      {LABEL[difficulty]}
    </span>
  );
}

export function RatingBadge({ rating }: { rating?: number | null }) {
  if (rating == null)
    return (
      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        unrated
      </span>
    );
  let color = "bg-slate-500/15 text-slate-700 dark:text-slate-300";
  if (rating < 1200) color = "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300";
  else if (rating < 1400)
    color = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  else if (rating < 1600) color = "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300";
  else if (rating < 1900) color = "bg-blue-500/15 text-blue-700 dark:text-blue-300";
  else if (rating < 2100)
    color = "bg-violet-500/15 text-violet-700 dark:text-violet-300";
  else if (rating < 2400)
    color = "bg-orange-500/15 text-orange-700 dark:text-orange-300";
  else color = "bg-red-500/15 text-red-700 dark:text-red-300";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono font-medium",
        color
      )}
    >
      {rating}
    </span>
  );
}
