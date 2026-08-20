"use client";

import type { TooltipContentProps } from "recharts";
import { colors } from "@/lib/theme";

export function ChartTooltip({
  active,
  payload,
  label,
}: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-sm border border-border bg-white px-2.5 py-2 text-2xs"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
    >
      {label != null && label !== "" ? (
        <p className="mb-1 font-semibold uppercase tracking-label text-muted">
          {String(label)}
        </p>
      ) : null}
      <ul className="space-y-0.5">
        {payload.map((item) => (
          <li
            key={String(item.dataKey ?? item.name)}
            className="flex items-center justify-between gap-4 tabular-nums text-ink"
          >
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block size-1.5 shrink-0"
                style={{ background: item.color ?? colors.ink }}
              />
              {String(item.name ?? item.dataKey)}
            </span>
            <span className="font-medium">
              {typeof item.value === "number"
                ? item.value.toLocaleString(undefined, {
                    maximumFractionDigits: 3,
                  })
                : String(item.value ?? "—")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
