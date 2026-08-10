"use client";

import { useEffect, useRef } from "react";
import { getGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type KillableTimeline = { kill: () => void };

type IntroPhase =
  | "navigation"
  | "screen"
  | "title"
  | "avatar"
  | "rolling"
  | "support"
  | "complete";

export function PageLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const number = numberRef.current;
    if (!root || !number) return;
    const { gsap } = getGsap();
    const complete = new Set<string>();
    const progress = { value: 0 };
    let finished = false;
    let loaderTimeline: KillableTimeline | null = null;
    const heroVisual =
      document.querySelector<HTMLElement>("[data-hero-visual]");

    const markPhase = (phase: IntroPhase) => {
      if (heroVisual) heroVisual.dataset.introState = phase;
      window.dispatchEvent(
        new CustomEvent("portfolio:hero-intro-phase", {
          detail: { phase },
        }),
      );
    };

    const completeExperience = () => {
      markPhase("complete");
      root.style.display = "none";
      document.body.dataset.loaded = "true";
      document.body.dataset.experienceReady = "true";
      window.dispatchEvent(new CustomEvent("portfolio:loader-complete"));
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      const timeline = gsap.timeline({
        id: "loaderTimeline",
        onComplete: completeExperience,
      });
      loaderTimeline = timeline;

      if (reducedMotion) {
        timeline
          .call(() => markPhase("navigation"))
          .call(() => markPhase("screen"))
          .call(() => markPhase("title"))
          .call(() => markPhase("avatar"))
          .call(() => {
            markPhase("rolling");
            window.dispatchEvent(new CustomEvent("portfolio:hero-roll-start"));
          })
          .call(() => markPhase("support"))
          .to(root, { opacity: 0, duration: 0.12 });
        return;
      }

      timeline
        .to(number, {
          yPercent: -18,
          duration: 0.14,
          ease: "power2.out",
        })
        .to(
          root,
          {
            yPercent: -102,
            duration: 0.72,
            ease: "power4.inOut",
          },
          "+=0.06",
        )
        .call(() => markPhase("navigation"), undefined, "-=0.48")
        .fromTo(
          "[data-site-header], [data-hero-eyebrow]",
          { yPercent: -110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.48,
            stagger: 0.06,
            ease: "power3.out",
          },
          "-=0.46",
        )
        .call(() => markPhase("screen"), undefined, "-=0.2")
        .fromTo(
          "[data-hero-screen-reveal]",
          {
            clipPath: "inset(0 50% 0 50%)",
            scaleX: 0.88,
            opacity: 0,
          },
          {
            clipPath: "inset(0 0% 0 0%)",
            scaleX: 1,
            opacity: 1,
            duration: 0.72,
            ease: "power4.inOut",
          },
          "-=0.2",
        )
        .call(() => markPhase("title"), undefined, "-=0.26")
        .fromTo(
          "[data-hero-title] .reveal-text__inner",
          { yPercent: 112 },
          {
            yPercent: 0,
            duration: 0.76,
            stagger: 0.07,
            ease: "power4.out",
          },
          "-=0.18",
        )
        .call(() => markPhase("avatar"), undefined, "-=0.36")
        .fromTo(
          "[data-hero-avatar-reveal]",
          {
            clipPath: "inset(100% 0 0 0)",
            yPercent: 6,
          },
          {
            clipPath: "inset(0% 0 0 0)",
            yPercent: 0,
            duration: 0.82,
            ease: "power4.out",
          },
          "-=0.18",
        )
        .call(
          () => {
            markPhase("rolling");
            window.dispatchEvent(new CustomEvent("portfolio:hero-roll-start"));
          },
          undefined,
          "-=0.42",
        )
        .call(() => markPhase("support"), undefined, "-=0.12")
        .fromTo(
          "[data-hero-footer], [data-hero-scroll-cue]",
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: "power3.out",
          },
          "-=0.08",
        );
    };

    const update = (task: string) => {
      if (complete.has(task)) return;
      complete.add(task);
      const next = Math.round((complete.size / 4) * 100);
      gsap.to(progress, {
        value: next,
        duration: reducedMotion ? 0.01 : 0.34,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => {
          number.textContent = `${Math.round(progress.value)}%`;
          root.setAttribute(
            "aria-valuenow",
            String(Math.round(progress.value)),
          );
        },
        onComplete: () => {
          if (next === 100) finish();
        },
      });
    };

    update("hydration");
    document.fonts.ready.then(() => update("fonts"));

    const avatar = document.querySelector<HTMLImageElement>(
      "[data-hero-avatar-image]",
    );
    const handleAvatar = () => update("avatar");
    if (!avatar || (avatar.complete && avatar.naturalWidth > 0)) {
      update("avatar");
    } else {
      avatar.addEventListener("load", handleAvatar, { once: true });
      avatar.addEventListener("error", handleAvatar, { once: true });
    }

    const handleHeroVisual = () => update("hero-visual");
    if (
      !heroVisual ||
      ["ready", "fallback"].includes(
        heroVisual.dataset.heroVisualState ?? "",
      )
    ) {
      update("hero-visual");
    } else {
      window.addEventListener(
        "portfolio:hero-visual-ready",
        handleHeroVisual,
        { once: true },
      );
    }

    const watchdog = window.setTimeout(() => {
      ["hydration", "fonts", "avatar", "hero-visual"].forEach(update);
    }, 4500);

    return () => {
      window.clearTimeout(watchdog);
      avatar?.removeEventListener("load", handleAvatar);
      avatar?.removeEventListener("error", handleAvatar);
      window.removeEventListener(
        "portfolio:hero-visual-ready",
        handleHeroVisual,
      );
      loaderTimeline?.kill();
      gsap.killTweensOf(progress);
    };
  }, [reducedMotion]);

  return (
    <div
      className="page-loader"
      ref={rootRef}
      role="progressbar"
      aria-label="Loading portfolio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <span className="page-loader__label">
        Abdullah / Creative developer
      </span>
      <span className="page-loader__number" ref={numberRef}>
        0%
      </span>
      <span className="page-loader__status">
        Preparing the experience
      </span>
    </div>
  );
}