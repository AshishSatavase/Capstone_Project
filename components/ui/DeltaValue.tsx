import { ChevronDown, ChevronUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDelta(value: number, digits: number, suffix: string) {
  const abs = Math.abs(value).toFixed(digits);
  if (value > 0) return `+${abs}${suffix}`;
  if (value < 0) return `-${abs}${suffix}`;
  return `${abs}${suffix}`;
}

export function DeltaValue({
  value,
  digits = 2,
  suffix = "%",
  className,
  showIcon = true,
}: {
  value: number;
  digits?: number;
  suffix?: string;
  className?: string;
  showIcon?: boolean;
}) {
  const up = value > 0;
  const down = value < 0;
  const Icon = up ? ChevronUp : down ? ChevronDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium tabular-nums",
        up && "text-positive",
        down && "text-ubs-red",
        !up && !down && "text-muted",
        className,
      )}
    >
      {showIcon ? <Icon className="size-3.5 shrink-0" strokeWidth={2.25} /> : null}
      {formatDelta(value, digits, suffix)}
    </span>
  );
}
