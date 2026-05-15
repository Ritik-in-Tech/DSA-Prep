import Link from "next/link";
import { ExternalLink, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DifficultyBadge,
  RatingBadge,
} from "@/components/problems/difficulty-badge";

import type { Problem, Topic, ProblemTopic } from "@prisma/client";

type RowProblem = Problem & {
  isSolved?: boolean;
  topics: (ProblemTopic & { topic: Topic })[];
};

export function ProblemRow({
  problem,
  showRating,
}: {
  problem: RowProblem;
  showRating?: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="w-10 align-middle text-muted-foreground">
        {problem.isSolved ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : null}
      </TableCell>
      <TableCell className="font-medium">
        <Link
          href={`/problems/${problem.platform.toLowerCase()}/${problem.slug}`}
          className="hover:underline"
        >
          {problem.title}
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {problem.topics.slice(0, 4).map((t) => (
            <Badge key={t.topicId} variant="secondary" className="font-normal">
              {t.topic.name}
            </Badge>
          ))}
          {problem.topics.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{problem.topics.length - 4}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="w-24">
        {showRating ? (
          <RatingBadge rating={problem.rating} />
        ) : (
          <DifficultyBadge difficulty={problem.difficulty} />
        )}
      </TableCell>
      <TableCell className="w-24 text-right">
        <Button asChild variant="outline" size="sm">
          <a href={problem.url} target="_blank" rel="noopener noreferrer">
            Solve <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </TableCell>
    </TableRow>
  );
}
