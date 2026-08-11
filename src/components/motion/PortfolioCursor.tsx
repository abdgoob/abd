"use client";

import TargetCursor from "@/components/TargetCursor/TargetCursor";

export function PortfolioCursor() {
  return (
    <TargetCursor
      spinDuration={2}
      hideDefaultCursor
      parallaxOn
      hoverDuration={0.2}
      cursorColor="#ffffff"
      cursorColorOnTarget="#B497CF"
    />
  );
}
