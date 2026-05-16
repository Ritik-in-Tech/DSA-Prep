import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pages,
  searchParams,
}: {
  page: number;
  pages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const buildHref = (next: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v == null) continue;
      if (Array.isArray(v)) v.forEach((x) => sp.append(k, x));
      else sp.set(k, String(v));
    }
    sp.set("page", String(next));
    return `?${sp.toString()}`;
  };

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-muted-foreground text-sm">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" disabled={page <= 1}>
          <Link href={page > 1 ? buildHref(page - 1) : "#"} aria-disabled={page <= 1}>
            <ChevronLeft className="h-3 w-3" /> Prev
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" disabled={page >= pages}>
          <Link href={page < pages ? buildHref(page + 1) : "#"} aria-disabled={page >= pages}>
            Next <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
