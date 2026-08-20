import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-border px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-header text-ink">
        {title}
      </p>
      {description ? (
        <p className="mt-2 max-w-sm text-xs text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
