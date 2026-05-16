"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { saveNoteAction } from "@/server/actions/notes";

import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

export function NotesEditor({ problemId, initial }: { problemId: string; initial: string }) {
  const [value, setValue] = useState<string>(initial ?? "");
  const [pending, startTransition] = useTransition();

  const save = () => {
    const form = new FormData();
    form.set("problemId", problemId);
    form.set("contentMd", value);
    startTransition(async () => {
      const res = await saveNoteAction(form);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  return (
    <div className="space-y-3">
      <div data-color-mode="auto">
        <MDEditor
          value={value}
          onChange={(v) => setValue(v ?? "")}
          height={280}
          preview="edit"
          textareaProps={{
            placeholder:
              "## Approach\n\n- key insight…\n\n## Complexity\n- Time: O(?), Space: O(?)\n\n## Edge cases\n",
          }}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save notes"}
        </Button>
      </div>
    </div>
  );
}
