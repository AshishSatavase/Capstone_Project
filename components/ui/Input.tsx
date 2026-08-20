import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-8 w-full rounded-sm border border-border bg-white px-2.5 text-xs text-ink outline-none placeholder:text-faint focus:border-ink",
        className,
      )}
      {...props}
    />
  );
}
