"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { getGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ScrollRequest = CustomEvent<{ top: number; immediate?: boolean }>;
type ScrollLockRequest = CustomEvent<{ locked: boolean }>;

export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      const handleNativeScroll = (event: Event) => {
        const { top } = (event as ScrollRequest).detail;
        window.scrollTo({ top, behavior: "auto" });
      };
      const handleLayout = () => window.dispatchEvent(new Event("resize"));
      window.addEventListener("portfolio:scroll-to", handleNativeScroll);
      window.addEventListener("portfolio:layout-change", handleLayout);
      window.dispatchEvent(new CustomEvent("portfolio:smooth-ready"));
      return () => {
        window.removeEventListener("portfolio:scroll-to", handleNativeScroll);
        window.removeEventListener("portfolio:layout-change", handleLayout);
      };
    }

    const { gsap, ScrollTrigger } = getGsap();
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.94,
      touchMultiplier: 1,
    });

    const updateScroll = ({ velocity }: { velocity: number }) => {
      const clamped = Math.max(-36, Math.min(36, velocity));
      const normalized = Math.max(-1, Math.min(1, clamped / 18));
      document.documentElement.style.setProperty("--scroll-velocity", normalized.toFixed(4));
      ScrollTrigger.update();
      window.dispatchEvent(
        new CustomEvent("portfolio:scroll-velocity", {
          detail: {
            velocity: clamped,
            normalized,
            direction: normalized === 0 ? 0 : normalized > 0 ? 1 : -1,
          },
        }),
      );
    };

    const tick = (time: number) => lenis.raf(time * 1000);
    const handleScrollRequest = (event: Event) => {
      const { top, immediate } = (event as ScrollRequest).detail;
      lenis.resize();
      lenis.scrollTo(top, { immediate: Boolean(immediate), force: true });
    };
    const handleScrollLock = (event: Event) => {
      if ((event as ScrollLockRequest).detail.locked) lenis.stop();
      else if (!document.hidden) lenis.start();
    };
    const handleLayout = () => {
      requestAnimationFrame(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      });
    };
    const handleVisibility = () => {
      if (document.hidden) lenis.stop();
      else lenis.start();
    };

    lenis.on("scroll", updateScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    window.addEventListener("portfolio:scroll-to", handleScrollRequest);
    window.addEventListener("portfolio:scroll-lock", handleScrollLock);
    window.addEventListener("portfolio:layout-change", handleLayout);
    document.addEventListener("visibilitychange", handleVisibility);
    window.dispatchEvent(new CustomEvent("portfolio:smooth-ready"));

    return () => {
      window.removeEventListener("portfolio:scroll-to", handleScrollRequest);
      window.removeEventListener("portfolio:scroll-lock", handleScrollLock);
      window.removeEventListener("portfolio:layout-change", handleLayout);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.documentElement.style.removeProperty("--scroll-velocity");
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return null;
}