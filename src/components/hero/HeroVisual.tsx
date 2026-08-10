"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { getGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const MARQUEE_COPY =
  "CREATIVE DEVELOPMENT • E-COMMERCE • AI-POWERED WEBSITES • FRONTEND → BACKEND • ";

const FACETS = ["far-left", "left", "center", "right", "far-right"] as const;

type ConnectionNavigator = Navigator & {
  connection?: { saveData?: boolean };
};

export function HeroVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let readyFrame = 0;

    const commitReady = () => {
      if (cancelled) return;
      root.dataset.heroVisualState = "ready";
      window.dispatchEvent(new CustomEvent("portfolio:hero-visual-ready"));
    };

    document.fonts.ready
      .then(() => {
        readyFrame = window.requestAnimationFrame(commitReady);
      })
      .catch(() => {
        if (!cancelled) {
          root.dataset.heroVisualState = "fallback";
          window.dispatchEvent(
            new CustomEvent("portfolio:hero-visual-ready"),
          );
        }
      });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(readyFrame);
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;

      const { gsap } = getGsap();

      const avatarIdle = document.querySelector<HTMLElement>(
        "[data-hero-avatar-idle]",
      );
      const avatarParallax = document.querySelector<HTMLElement>(
        "[data-hero-avatar-parallax]",
      );
      const titleName = document.querySelector<HTMLElement>(
        ".hero__title-name",
      );
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const saveData = Boolean(
        (navigator as ConnectionNavigator).connection?.saveData,
      );
      const staticMotion = reducedMotion || saveData;
      let onScreen = true;
      let pageVisible = !document.hidden;
      let rollRequested = document.body.dataset.loaded === "true";
      let pointerTimer = 0;
      let revealTimer = 0;
      let titleBounds: DOMRect | null = null;
      let revealRadius = 90;
      const pointerViewport = {
        width: Math.max(window.innerWidth, 1),
        height: Math.max(window.innerHeight, 1),
      };

      const profile = () => {
        if (staticMotion) return "static";
        if (window.innerWidth < 768) return "mobile";
        if (window.innerWidth < 1024) return "tablet";
        return "desktop";
      };
      const duration = () => {
        const current = profile();
        if (current === "mobile") return 44;
        if (current === "tablet") return 40;
        return 36;
      };
      const allowsPointer = () =>
        !staticMotion &&
        window.matchMedia("(pointer: fine)").matches &&
        window.innerWidth >= 768;

      const refreshTitleBounds = () => {
        titleBounds = titleName?.getBoundingClientRect() ?? null;
        revealRadius = Math.min(
          110,
          Math.max(70, pointerViewport.width * 0.0625),
        );

        if (titleName && titleBounds) {
          titleName.style.setProperty(
            "--hero-reveal-x",
            `${titleBounds.width / 2}px`,
          );
          titleName.style.setProperty(
            "--hero-reveal-y",
            `${titleBounds.height / 2}px`,
          );
          titleName.style.setProperty(
            "--hero-reveal-radius",
            `${revealRadius}px`,
          );
        }
      };

      refreshTitleBounds();

      root.dataset.motionProfile = profile();
      root.dataset.pointerState = allowsPointer() ? "idle" : "disabled";
      if (titleName) {
        titleName.dataset.colorReveal = allowsPointer() ? "idle" : "disabled";
      }


      const roll = gsap.fromTo(
        track,
        { xPercent: 0 },
        {
          xPercent: -50,
          duration: duration(),
          ease: "none",
          repeat: -1,
          paused: true,
        },
      );

      const updateRoll = () => {
        const running =
          !staticMotion && rollRequested && onScreen && pageVisible;
        roll.paused(!running);
        root.dataset.rollState = staticMotion
          ? "static"
          : running
            ? "running"
            : "paused";
      };
      updateRoll();

      const idleTween =
        !staticMotion && avatarIdle
          ? gsap
              .timeline({ repeat: -1 })
              .to(avatarIdle, {
                y: -10,
                rotation: -2.5,
                duration: 3.2,
                ease: "sine.inOut",
                transformOrigin: "50% 100%",
              })
              .to(avatarIdle, {
                y: -4,
                rotation: 0.5,
                duration: 2.8,
                ease: "sine.inOut",
              })
              .to(avatarIdle, {
                y: 0,
                rotation: 0.5,
                duration: 2.8,
                ease: "sine.inOut",
              })
          : null;

      const avatarX = avatarParallax
        ? gsap.quickTo(avatarParallax, "x", {
            duration: 1.05,
            ease: "power3.out",
          })
        : null;
      const avatarY = avatarParallax
        ? gsap.quickTo(avatarParallax, "y", {
            duration: 1.1,
            ease: "power3.out",
          })
        : null;
      const avatarRotateX = avatarParallax
        ? gsap.quickTo(avatarParallax, "rotationX", {
            duration: 1.1,
            ease: "power3.out",
          })
        : null;
      const avatarRotateY = avatarParallax
        ? gsap.quickTo(avatarParallax, "rotationY", {
            duration: 1.05,
            ease: "power3.out",
          })
        : null;
      const revealX = titleName
        ? gsap.quickTo(titleName, "--hero-reveal-x", {
            duration: 0.58,
            ease: "power3.out",
          })
        : null;
      const revealY = titleName
        ? gsap.quickTo(titleName, "--hero-reveal-y", {
            duration: 0.62,
            ease: "power3.out",
          })
        : null;
      const revealOpacity = titleName
        ? gsap.quickTo(titleName, "--hero-reveal-opacity", {
            duration: 0.34,
            ease: "power2.out",
          })
        : null;

      const settleReveal = () => {
        if (!titleName || titleName.dataset.colorReveal !== "active") return;
        revealOpacity?.(0);
        titleName.dataset.colorReveal = "settling";
        window.clearTimeout(revealTimer);
        revealTimer = window.setTimeout(() => {
          revealTimer = 0;
          if (titleName.dataset.colorReveal !== "disabled") {
            titleName.dataset.colorReveal = "idle";
          }
        }, 720);
      };
      const resetPointerMotion = () => {
        avatarX?.(0);
        avatarY?.(0);
        avatarRotateX?.(0);
        avatarRotateY?.(0);
        settleReveal();
      };

      const settlePointer = () => {
        resetPointerMotion();
        if (root.dataset.pointerState !== "disabled") {
          root.dataset.pointerState = "settling";
          window.clearTimeout(pointerTimer);
          pointerTimer = window.setTimeout(() => {
            root.dataset.pointerState = "idle";
          }, 1200);
        }
      };

      const handlePointer = (event: PointerEvent) => {
        if (!allowsPointer() || !hero) return;
        const x = Math.max(
          -1,
          Math.min(1, (event.clientX / pointerViewport.width) * 2 - 1),
        );
        const y = Math.max(
          -1,
          Math.min(1, (event.clientY / pointerViewport.height) * 2 - 1),
        );
        if (root.dataset.pointerState !== "active") {
          root.dataset.pointerState = "active";
        }
        window.clearTimeout(pointerTimer);
        avatarX?.(x * 10);
        avatarY?.(y * 7);
        avatarRotateX?.(y * -1.5);
        avatarRotateY?.(x * 2.5);

        if (!titleName || !titleBounds) return;
        const revealPadding = revealRadius * 0.72;
        const insideRevealZone =
          event.clientX >= titleBounds.left - revealPadding &&
          event.clientX <= titleBounds.right + revealPadding &&
          event.clientY >= titleBounds.top - revealPadding &&
          event.clientY <= titleBounds.bottom + revealPadding;

        if (insideRevealZone) {
          window.clearTimeout(revealTimer);
          revealTimer = 0;
          titleName.dataset.colorReveal = "active";
          revealX?.(event.clientX - titleBounds.left);
          revealY?.(event.clientY - titleBounds.top);
          revealOpacity?.(1);
        } else {
          settleReveal();
        }
      };

      const handleRollStart = () => {
        rollRequested = true;
        updateRoll();
      };
      const handleVisibility = () => {
        pageVisible = !document.hidden;
        idleTween?.paused(!pageVisible || !onScreen);
        updateRoll();
      };
      const handleResize = () => {
        pointerViewport.width = Math.max(window.innerWidth, 1);
        pointerViewport.height = Math.max(window.innerHeight, 1);
        refreshTitleBounds();
        root.dataset.motionProfile = profile();
        roll.duration(duration());
        if (!allowsPointer()) {
          window.clearTimeout(pointerTimer);
          resetPointerMotion();
          root.dataset.pointerState = "disabled";
          if (titleName) titleName.dataset.colorReveal = "disabled";
        } else if (root.dataset.pointerState === "disabled") {
          root.dataset.pointerState = "idle";
          if (titleName) titleName.dataset.colorReveal = "idle";
        }
      };

      const intersection = hero
        ? new IntersectionObserver(
            ([entry]) => {
              onScreen = entry.isIntersecting;
              idleTween?.paused(!onScreen || !pageVisible);
              updateRoll();
            },
            { rootMargin: "12% 0px" },
          )
        : null;
      if (hero && intersection) intersection.observe(hero);

      window.addEventListener("portfolio:hero-roll-start", handleRollStart);
      window.addEventListener("portfolio:loader-complete", handleRollStart);
      hero?.addEventListener("pointermove", handlePointer, { passive: true });
      hero?.addEventListener("pointerenter", refreshTitleBounds);
      hero?.addEventListener("pointerleave", settlePointer);
      window.addEventListener("pointerleave", settlePointer);
      window.addEventListener("blur", settlePointer);
      window.addEventListener("resize", handleResize, { passive: true });
      document.addEventListener("visibilitychange", handleVisibility);

      return () => {
        window.clearTimeout(pointerTimer);
        window.clearTimeout(revealTimer);
        intersection?.disconnect();
        window.removeEventListener(
          "portfolio:hero-roll-start",
          handleRollStart,
        );
        window.removeEventListener("portfolio:loader-complete", handleRollStart);
        hero?.removeEventListener("pointermove", handlePointer);
        hero?.removeEventListener("pointerenter", refreshTitleBounds);
        hero?.removeEventListener("pointerleave", settlePointer);
        window.removeEventListener("pointerleave", settlePointer);
        window.removeEventListener("blur", settlePointer);
        window.removeEventListener("resize", handleResize);
        document.removeEventListener("visibilitychange", handleVisibility);
        idleTween?.kill();
        roll.kill();
        if (titleName) {
          delete titleName.dataset.colorReveal;
          titleName.style.removeProperty("--hero-reveal-x");
          titleName.style.removeProperty("--hero-reveal-y");
          titleName.style.removeProperty("--hero-reveal-radius");
          titleName.style.removeProperty("--hero-reveal-opacity");
        }
      };
    },
    { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <div
      ref={rootRef}
      className="hero-visual"
      aria-hidden="true"
      data-hero-visual
      data-hero-visual-state="loading"
      data-motion-profile="pending"
      data-roll-state="paused"
      data-pointer-state="idle"
    >
      <div className="hero-screen" data-hero-screen-depth>
        <div className="hero-screen__reveal" data-hero-screen-reveal>
          <div
            className="hero-screen__viewport"
            data-hero-marquee
          >
            <div className="hero-screen__tilt" data-hero-screen-tilt>
              <div
                ref={trackRef}
                className="hero-marquee__track"
                data-hero-marquee-track
              >
                <span
                  className="hero-marquee__group"
                  data-marquee-group="original"
                >
                  {MARQUEE_COPY}
                </span>
                <span
                  className="hero-marquee__group"
                  data-marquee-group="clone"
                  aria-hidden="true"
                >
                  {MARQUEE_COPY}
                </span>
              </div>
            </div>
            <div className="hero-marquee__facets">
              {FACETS.map((facet) => (
                <span
                  key={facet}
                  className={
                    "hero-marquee__facet hero-marquee__facet--" + facet
                  }
                  data-hero-marquee-segment={facet}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}