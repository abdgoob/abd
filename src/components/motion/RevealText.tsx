"use client";

import { cn } from "@/lib/cn";

export function RevealText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={cn("reveal-text", className)} aria-label={text}>
      <span className="reveal-text__inner" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
