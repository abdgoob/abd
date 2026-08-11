"use client";

import type { ReactNode } from "react";
import { AnchorNavigation } from "./AnchorNavigation";
import { SmoothScroll } from "./SmoothScroll";
import { PageLoader } from "./PageLoader";
import { PortfolioCursor } from "./PortfolioCursor";
import { ScrollMotion } from "./ScrollMotion";

export function ExperienceProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <AnchorNavigation />
      <SmoothScroll />
      <PageLoader />
      <PortfolioCursor />
      <ScrollMotion />
      {children}
    </>
  );
}
