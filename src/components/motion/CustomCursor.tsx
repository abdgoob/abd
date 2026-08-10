"use client";

import { useEffect, useRef } from "react";
import { getGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const cursorSizes: Record<string, number> = {
  default: 8,
  link: 30,
  navigation: 34,
  whatsapp: 88,
  project: 118,
  "project-live": 118,
};

const defaultLabels: Record<string, string> = {
  whatsapp: "Open ↗",
  project: "View",
  "project-live": "Live ↗",
};

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const cursor = cursorRef.current;
    const label = labelRef.current;
    if (!cursor || !label || reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const { gsap } = getGsap();
    const current = { x: -100, y: -100 };
    const target = { x: -100, y: -100 };
    let visible = false;
    let activeState = "default";
    const setX = gsap.quickSetter(cursor, "x", "px");
    const setY = gsap.quickSetter(cursor, "y", "px");

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    document.body.classList.add("custom-cursor-active");

    const updateState = (element: Element | null) => {
      const explicit = element?.closest<HTMLElement>("[data-cursor]");
      const state = explicit?.dataset.cursor ?? (element?.closest("a, button") ? "link" : "default");
      if (state === activeState) return;
      activeState = state;
      const size = cursorSizes[state] ?? cursorSizes.default;
      label.textContent = explicit?.dataset.cursorLabel ?? defaultLabels[state] ?? "";
      cursor.dataset.state = state;
      gsap.to(cursor, {
        width: size,
        height: size,
        duration: 0.34,
        ease: "power3.out",
        overwrite: "auto",
      });
      window.dispatchEvent(
        new CustomEvent("portfolio:cursor-state", {
          detail: {
            state,
            intensity: state.startsWith("project") ? 1 : state === "whatsapp" ? 0.65 : 0.18,
          },
        }),
      );
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.24;
      current.y += (target.y - current.y) * 0.24;
      setX(current.x);
      setY(current.y);
    };

    const handleMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!visible) {
        visible = true;
        current.x = target.x;
        current.y = target.y;
        setX(current.x);
        setY(current.y);
        gsap.to(cursor, { opacity: 1, duration: 0.16, overwrite: "auto" });
      }
      updateState(event.target as Element);
    };
    const refreshState = () => {
      if (!visible) return;
      updateState(document.elementFromPoint(target.x, target.y));
    };
    const handleDown = () => gsap.to(cursor, { scale: 0.82, duration: 0.12, ease: "power2.out" });
    const handleUp = () => gsap.to(cursor, { scale: 1, duration: 0.24, ease: "power3.out" });
    const handleLeave = () => {
      visible = false;
      gsap.to(cursor, { opacity: 0, duration: 0.18, overwrite: "auto" });
    };

    gsap.ticker.add(tick);
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("scroll", refreshState, { passive: true });
    window.addEventListener("pointerdown", handleDown, { passive: true });
    window.addEventListener("pointerup", handleUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleLeave);
    window.addEventListener("blur", handleLeave);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      gsap.ticker.remove(tick);
      gsap.killTweensOf(cursor);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("scroll", refreshState);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("blur", handleLeave);
    };
  }, [reducedMotion]);

  return (
    <div className="custom-cursor" ref={cursorRef} aria-hidden="true" data-state="default">
      <i className="custom-cursor__dot" />
      <span ref={labelRef} />
    </div>
  );
}