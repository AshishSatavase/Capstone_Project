import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DeltaValue } from "@/components/ui/DeltaValue";

export function StatChip({
  label,
  value,
  delta,
  deltaSuffix = "%",
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: number;
  deltaSuffix?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-[140px] flex-1 border border-border bg-white px-3 py-2.5",
        className,
      )}
    >
      <p className="text-2xs font-semibold uppercase tracking-label text-muted">
        {label}
      </p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <p className="text-lg font-semibold tabular-nums leading-none text-ink">
          {value}
        </p>
        {typeof delta === "number" ? (
          <DeltaValue value={delta} suffix={deltaSuffix} className="text-xs" />
        ) : null}
      </div>
      {hint ? (
        <p className="mt-1.5 text-2xs text-faint">{hint}</p>
      ) : null}
    </div>
  );
}
