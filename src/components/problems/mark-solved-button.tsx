"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { markSolvedAction } from "@/server/actions/notes";

export function MarkSolvedButton({ problemId }: { problemId: string }) {
  const [pending, startTransition] = useTransition();
  const onClick = () => {
    const form = new FormData();
    form.set("problemId", problemId);
    startTransition(async () => {
      const res = await markSolvedAction(form);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  };
  return (
    <Button variant="outline" onClick={onClick} disabled={pending}>
      <CheckCircle2 className="h-4 w-4" /> Mark solved
    </Button>
  );
}
