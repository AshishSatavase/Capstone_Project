import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

const WATCH: Record<string, "red" | "outline" | "muted" | "default"> = {
  D: "red",
  C: "red",
  "C+": "red",
  BB: "muted",
  "BB+": "muted",
  BBB: "default",
  "BBB+": "default",
  A: "outline",
  "A+": "outline",
  AA: "outline",
  "AA+": "outline",
  AAA: "outline",
};

export function RatingBadge({
  rating,
  className,
}: {
  rating: string;
  className?: string;
}) {
  const key = rating.toUpperCase();
  const variant = WATCH[key] ?? "default";

  return (
    <Badge variant={variant} className={cn("font-bold", className)} title={rating}>
      {rating}
    </Badge>
  );
}
