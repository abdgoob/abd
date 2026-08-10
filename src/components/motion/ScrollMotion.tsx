"use client";

import { useGSAP } from "@gsap/react";
import { getGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ScrollMotion() {
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      const { gsap, ScrollTrigger } = getGsap();
      gsap.registerPlugin(useGSAP);
      const media = gsap.matchMedia();
      let velocity = 0;
      let velocityTarget = 0;
      const projectTitles = gsap.utils.toArray<HTMLElement>(".project-row__title");
      const projectIndexes = gsap.utils.toArray<HTMLElement>(".project-row__index");

      const handleVelocity = (event: Event) => {
        const detail = (event as CustomEvent<{ normalized?: number; velocity: number }>).detail;
        velocityTarget = detail.normalized ?? Math.max(-1, Math.min(1, detail.velocity / 18));
      };
      const velocityTick = () => {
        velocity += (velocityTarget - velocity) * 0.09;
        velocityTarget *= 0.92;
        gsap.set(projectTitles, {
          x: (index: number) => velocity * (index % 2 === 0 ? 18 : -18),
          skewX: velocity * -0.42,
        });
        gsap.set(projectIndexes, { x: velocity * -10 });
        document.documentElement.style.setProperty("--settled-velocity", velocity.toFixed(4));
      };

      window.addEventListener("portfolio:scroll-velocity", handleVelocity);
      gsap.ticker.add(velocityTick);

      media.add("(min-width: 768px)", () => {
        const hero = document.querySelector<HTMLElement>("[data-hero]");
        if (hero) {
          gsap.timeline({
            id: "heroScrollTimeline",
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 0.65,
            },
          })
            .to("[data-hero-eyebrow]", { yPercent: -96, xPercent: -2 }, 0)
            .to(".hero__title-intro", { yPercent: -28, xPercent: -3 }, 0)
            .to(
              ".hero__title-name",
              { yPercent: -14, xPercent: 3, scale: 1.02 },
              0,
            )
            .to(
              "[data-hero-avatar-depth]",
              { yPercent: 10, scale: 0.97 },
              0,
            )
            .to(
              "[data-hero-screen-depth]",
              {
                yPercent: -7,
                scale: 0.965,
                rotationX: 2,
                transformPerspective: 1000,
                transformOrigin: "50% 50%",
              },
              0,
            )
            .to("[data-hero-footer]", { yPercent: -34, xPercent: 2 }, 0)
            .to(
              "[data-hero-scroll-cue]",
              { yPercent: -120, opacity: 0 },
              0,
            );
        }

        gsap.utils
          .toArray<HTMLElement>(".project-row__summary, .service-row, .process-row")
          .forEach((target) => {
            gsap.fromTo(
              target,
              { y: 54, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.82,
                ease: "power3.out",
                scrollTrigger: { trigger: target, start: "top 91%", once: true },
              },
            );
          });
      });

      media.add("all", () => {
        gsap.utils
          .toArray<HTMLElement>(
            ".selected-work__intro h2, .home-section__intro h2, .about-section h2, .contact-section h2",
          )
          .forEach((target) => {
            gsap.fromTo(
              target,
              { yPercent: 24, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 0.92,
                ease: "power4.out",
                scrollTrigger: { trigger: target, start: "top 91%", once: true },
              },
            );
          });

        gsap.utils.toArray<HTMLElement>(".home-section__intro > p, .about-section__grid > div").forEach((target) => {
          gsap.fromTo(
            target,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: target, start: "top 92%", once: true },
            },
          );
        });

        requestAnimationFrame(() => ScrollTrigger.refresh());
      });

      return () => {
        window.removeEventListener("portfolio:scroll-velocity", handleVelocity);
        gsap.ticker.remove(velocityTick);
        document.documentElement.style.removeProperty("--settled-velocity");
        media.revert();
      };
    },
    { dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return null;
}