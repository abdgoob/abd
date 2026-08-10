"use client";

import type { ReactNode } from "react";
import { AnchorNavigation } from "./AnchorNavigation";
import { SmoothScroll } from "./SmoothScroll";
import { PageLoader } from "./PageLoader";
import { CustomCursor } from "./CustomCursor";
import { ScrollMotion } from "./ScrollMotion";

export function ExperienceProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <AnchorNavigation />
      <SmoothScroll />
      <PageLoader />
      <CustomCursor />
      <ScrollMotion />
      {children}
    </>
  );
}