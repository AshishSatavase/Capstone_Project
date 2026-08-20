"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function ChartContainer({
  title,
  eyebrow,
  actions,
  height = 260,
  loading = false,
  children,
  className,
}: {
  title?: string;
  eyebrow?: string;
  actions?: ReactNode;
  height?: number;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border border-border bg-white", className)}>
      {title ? (
        <div className="px-3 pt-3">
          <SectionHeader title={title} eyebrow={eyebrow} actions={actions} />
        </div>
      ) : null}
      <div className="px-1 pb-2" style={{ height }}>
        {loading ? <ChartSkeleton height={height - 8} /> : children}
      </div>
    </div>
  );
}
