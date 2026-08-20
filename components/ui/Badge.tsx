import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-border bg-white text-ink",
  red: "border-ubs-red/30 bg-white text-ubs-red",
  outline: "border-ink text-ink bg-white",
  muted: "border-border bg-white text-muted",
} as const;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-label leading-none whitespace-nowrap",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
