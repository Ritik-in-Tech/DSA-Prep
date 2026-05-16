import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Check, Circle } from "lucide-react";

import { auth } from "@/auth";
import { getSheetWithSections } from "@/server/services/sheets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";

export default async function SheetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const sheet = await getSheetWithSections(slug, session?.user?.id ?? null);
  if (!sheet) notFound();

  const pct = sheet.total === 0 ? 0 : Math.round((sheet.solved / sheet.total) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{sheet.name}</CardTitle>
              {sheet.description && (
                <p className="text-muted-foreground mt-1 text-sm">{sheet.description}</p>
              )}
              {sheet.source && (
                <a
                  href={sheet.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground mt-2 inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline"
                >
                  Source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="min-w-48 text-right">
              <p className="font-mono text-2xl">
                {sheet.solved}/{sheet.total}
              </p>
              <p className="text-muted-foreground text-xs">{pct}% complete</p>
              <div className="pt-2">
                <Progress value={pct} />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="space-y-2">
        {sheet.sections.map((sec) => {
          const secPct = sec.total === 0 ? 0 : Math.round((sec.solved / sec.total) * 100);
          return (
            <AccordionItem key={sec.id} value={sec.id} className="rounded-md border px-4">
              <AccordionTrigger>
                <div className="flex w-full items-center justify-between pr-3">
                  <span className="font-medium">{sec.name}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {sec.solved}/{sec.total}
                    </Badge>
                    <span className="w-24">
                      <Progress value={secPct} />
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="divide-y">
                  {sec.problems.map((sp) => (
                    <li key={sp.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {sp.isSolved ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className="text-muted-foreground/40 h-4 w-4" />
                        )}
                        <Link
                          href={`/problems/${sp.problem.platform.toLowerCase()}/${sp.problem.slug}`}
                          className="flex-1 truncate text-sm hover:underline"
                        >
                          {sp.problem.title}
                        </Link>
                        <DifficultyBadge difficulty={sp.problem.difficulty} />
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <a href={sp.problem.url} target="_blank" rel="noopener noreferrer">
                          Solve <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
