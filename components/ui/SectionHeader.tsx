import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  eyebrow,
  actions,
  className,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="mb-1 text-2xs font-semibold uppercase tracking-header text-muted">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-sm font-bold uppercase tracking-header text-ink">
            {title}
          </h2>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <div className="mt-1.5 h-px w-full bg-border">
        <div className="h-[2px] w-16 bg-ubs-red" />
      </div>
    </div>
  );
}
