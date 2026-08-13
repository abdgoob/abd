"use client";

import { useState, useSyncExternalStore } from "react";
import WarpText from "@/components/WarpText/WarpText";

type ProjectDescriptionWarpProps = {
  active: boolean;
  text: string;
};

const MOBILE_QUERY = "(max-width: 767px), (pointer: coarse)";

function subscribeToMobileQuery(callback: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function ActiveWarpText({ text }: { text: string }) {
  const [ready, setReady] = useState(false);
  const [layoutHeight, setLayoutHeight] = useState<number>();
  const isMobile = useSyncExternalStore(
    subscribeToMobileQuery,
    getMobileSnapshot,
    () => false,
  );

  return (
    <div
      className="project-description-warp__active"
      style={layoutHeight ? { minHeight: layoutHeight } : undefined}
    >
      <p
        className={
          "project-description-warp__fallback" + (ready ? " is-hidden" : "")
        }
        aria-hidden="true"
      >
        {text}
      </p>
      <div className="project-description-warp__surface" aria-hidden="true">
        <WarpText
          text={text}
          color="var(--project-fg)"
          warpStrength={isMobile ? 0.022 : 0.045}
          warpScale={1.55}
          speed={isMobile ? 0.24 : 0.38}
          pointerInfluence={isMobile ? 0.18 : 0.3}
          pointerStrength={isMobile ? 0.1 : 0.22}
          refraction={isMobile ? 0.002 : 0.006}
          ripple={!isMobile}
          fontSize="var(--project-description-font-size)"
          fontWeight={700}
          fontFamily="inherit"
          letterSpacing="-0.065em"
          lineHeight={0.94}
          textAlign="left"
          className="project-description-warp__canvas"
          onReady={() => setReady(true)}
          onLayoutHeight={(height) =>
            setLayoutHeight((current) => (current === height ? current : height))
          }
        />
      </div>
    </div>
  );
}

export function ProjectDescriptionWarp({
  active,
  text,
}: ProjectDescriptionWarpProps) {
  return (
    <div className="project-description-warp" data-project-warp-text>
      <p className="sr-only">{text}</p>
      {active ? (
        <ActiveWarpText text={text} />
      ) : (
        <p className="project-description-warp__fallback" aria-hidden="true">
          {text}
        </p>
      )}
    </div>
  );
}
