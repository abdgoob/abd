"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { memo, useEffect, useRef, useState, useSyncExternalStore } from "react";

const HalftoneReveal = dynamic(
  () => import("@/components/HalftoneReveal/HalftoneReveal"),
  { ssr: false },
);

const interactionQuery =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

let supportsWebgl2: boolean | undefined;

function hasWebgl2Support() {
  if (supportsWebgl2 !== undefined) return supportsWebgl2;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2");
  supportsWebgl2 = Boolean(context);
  context?.getExtension("WEBGL_lose_context")?.loseContext();
  return supportsWebgl2;
}

function subscribeToInteractionCapability(callback: () => void) {
  const media = window.matchMedia(interactionQuery);
  media.addEventListener("change", callback);
  window.addEventListener("popstate", callback);

  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener("popstate", callback);
  };
}

function getInteractionCapability() {
  const webglDisabled = new URLSearchParams(window.location.search).has("webgl-off");
  return !webglDisabled && window.matchMedia(interactionQuery).matches && hasWebgl2Support();
}

type ProjectHalftoneMediaProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
};

function ProjectHalftoneMediaComponent({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
}: ProjectHalftoneMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const canUseHalftone = useSyncExternalStore(
    subscribeToInteractionCapability,
    getInteractionCapability,
    () => false,
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !canUseHalftone) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: "50% 0px", threshold: 0 },
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, [canUseHalftone]);

  const showHalftone = canUseHalftone && isNearViewport;

  return (
    <div
      ref={rootRef}
      className="project-halftone"
      data-project-halftone
      data-halftone-state={showHalftone ? "active" : "fallback"}
    >
      <Image
        className="project-halftone__fallback"
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
      />
      {showHalftone ? (
        <div className="project-halftone__effect">
          <HalftoneReveal
            src={src}
            inkColor="#141414"
            paperColor="#fff7e6"
            mode="mono"
            dotDensity={71}
            angle={45}
            revealRadius={0.4}
            dotSize={1}
            shape="circle"
            contrast={1.15}
            invert={false}
            edge={0.8}
            follow={0.37}
            idleReveal={0}
            trigger="hover"
            borderRadius="inherit"
            style={undefined}
          />
        </div>
      ) : null}
    </div>
  );
}

export const ProjectHalftoneMedia = memo(ProjectHalftoneMediaComponent);
