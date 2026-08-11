"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import "./TargetCursor.css";

const cursorCapabilityQuery =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribeToCursorCapability(callback: () => void) {
  const media = window.matchMedia(cursorCapabilityQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getCursorCapability() {
  return window.matchMedia(cursorCapabilityQuery).matches;
}

// A position: fixed element is positioned relative to the viewport UNLESS an
// ancestor establishes a containing block (transform, perspective, filter,
// will-change of those, or contain). When that happens, the cursor's translate
// no longer maps to viewport coordinates, so we measure and compensate for it.
const getContainingBlock = (element: HTMLElement | null): HTMLElement | null => {
  let node = element?.parentElement ?? null;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    if (
      style.transform !== "none" ||
      style.perspective !== "none" ||
      style.filter !== "none" ||
      style.willChange.includes("transform") ||
      style.willChange.includes("perspective") ||
      style.willChange.includes("filter") ||
      /paint|layout|strict|content/.test(style.contain)
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

const getContainingBlockOffset = (block: HTMLElement | null): { x: number; y: number } => {
  if (!block) return { x: 0, y: 0 };
  const rect = block.getBoundingClientRect();
  return { x: rect.left + block.clientLeft, y: rect.top + block.clientTop };
};

export interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
  parallaxOn?: boolean;
  cursorColor?: string;
  cursorColorOnTarget?: string;
}

const TargetCursor = ({
  targetSelector = ".cursor-target",
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  cursorColor = "#ffffff",
  cursorColorOnTarget,
}: TargetCursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const spinTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const canUseCursor = useSyncExternalStore(
    subscribeToCursorCapability,
    getCursorCapability,
    () => false,
  );

  useEffect(() => {
    if (!canUseCursor || !cursorRef.current || !dotRef.current) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const corners = Array.from(
      cursor.querySelectorAll<HTMLDivElement>(".target-cursor-corner"),
    );
    if (corners.length !== 4) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = "none";
      document.body.classList.add("target-cursor-active");
    }

    const constants = { borderWidth: 3, cornerSize: 12 };
    const collapsedPositions = [
      { x: -constants.cornerSize * 1.5, y: -constants.cornerSize * 1.5 },
      { x: constants.cornerSize * 0.5, y: -constants.cornerSize * 1.5 },
      { x: constants.cornerSize * 0.5, y: constants.cornerSize * 0.5 },
      { x: -constants.cornerSize * 1.5, y: constants.cornerSize * 0.5 },
    ];
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const activeStrength = { current: 0 };
    let containingBlock = getContainingBlock(cursor);
    let containingBlockOffset = getContainingBlockOffset(containingBlock);
    let activeTarget: Element | null = null;
    let targetCornerPositions: { x: number; y: number }[] | null = null;
    let targetGeometryFrame = 0;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;
    let tickerActive = false;

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: pointer.x - containingBlockOffset.x,
      y: pointer.y - containingBlockOffset.y,
    });
    corners.forEach((corner, index) => {
      gsap.set(corner, collapsedPositions[index]);
    });

    // These quickTo functions are created once and reused for every pointer or
    // ticker update instead of allocating a new tween for every event/frame.
    const cursorXTo = gsap.quickTo(cursor, "x", {
      duration: 0.06,
      ease: "power3.out",
    });
    const cursorYTo = gsap.quickTo(cursor, "y", {
      duration: 0.06,
      ease: "power3.out",
    });
    const cornerXTo = corners.map((corner) =>
      gsap.quickTo(corner, "x", {
        duration: parallaxOn ? 0.08 : 0.01,
        ease: "power1.out",
      }),
    );
    const cornerYTo = corners.map((corner) =>
      gsap.quickTo(corner, "y", {
        duration: parallaxOn ? 0.08 : 0.01,
        ease: "power1.out",
      }),
    );

    const createSpinTimeline = () => {
      spinTimelineRef.current?.kill();
      spinTimelineRef.current = gsap
        .timeline({ repeat: -1 })
        .to(cursor, { rotation: "+=360", duration: spinDuration, ease: "none" });
    };

    const updateContainingBlock = () => {
      containingBlock = getContainingBlock(cursor);
      containingBlockOffset = getContainingBlockOffset(containingBlock);
    };

    const updateTargetGeometry = () => {
      targetGeometryFrame = 0;
      if (!activeTarget) return;

      const rect = activeTarget.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const { x: offsetX, y: offsetY } = containingBlockOffset;
      targetCornerPositions = [
        { x: rect.left - borderWidth - offsetX, y: rect.top - borderWidth - offsetY },
        {
          x: rect.right + borderWidth - cornerSize - offsetX,
          y: rect.top - borderWidth - offsetY,
        },
        {
          x: rect.right + borderWidth - cornerSize - offsetX,
          y: rect.bottom + borderWidth - cornerSize - offsetY,
        },
        {
          x: rect.left - borderWidth - offsetX,
          y: rect.bottom + borderWidth - cornerSize - offsetY,
        },
      ];
    };

    const scheduleTargetGeometry = () => {
      if (!activeTarget || targetGeometryFrame) return;
      targetGeometryFrame = window.requestAnimationFrame(updateTargetGeometry);
    };

    const ticker = () => {
      if (!targetCornerPositions) return;

      const strength = activeStrength.current;
      if (strength <= 0) return;

      const cursorX = gsap.getProperty(cursor, "x") as number;
      const cursorY = gsap.getProperty(cursor, "y") as number;

      corners.forEach((corner, index) => {
        const currentX = gsap.getProperty(corner, "x") as number;
        const currentY = gsap.getProperty(corner, "y") as number;
        const targetX = targetCornerPositions![index].x - cursorX;
        const targetY = targetCornerPositions![index].y - cursorY;
        cornerXTo[index](currentX + (targetX - currentX) * strength);
        cornerYTo[index](currentY + (targetY - currentY) * strength);
      });
    };

    const addTicker = () => {
      if (tickerActive) return;
      gsap.ticker.add(ticker);
      tickerActive = true;
    };

    const removeTicker = () => {
      if (!tickerActive) return;
      gsap.ticker.remove(ticker);
      tickerActive = false;
    };

    const resumeSpin = () => {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        if (!activeTarget) createSpinTimeline();
        resumeTimeout = null;
      }, 50);
    };

    const leaveTarget = (restartSpin = true) => {
      if (!activeTarget) return;

      activeTarget = null;
      targetCornerPositions = null;
      removeTicker();
      gsap.killTweensOf(activeStrength);
      gsap.set(activeStrength, { current: 0 });
      cursor.dataset.targetState = "idle";

      if (cursorColorOnTarget) {
        gsap.to(corners, {
          borderColor: cursorColor,
          duration: 0.15,
          ease: "power2.out",
          overwrite: true,
        });
        gsap.to(dot, {
          backgroundColor: cursorColor,
          duration: 0.15,
          ease: "power2.out",
          overwrite: true,
        });
      }

      corners.forEach((_, index) => {
        cornerXTo[index](collapsedPositions[index].x);
        cornerYTo[index](collapsedPositions[index].y);
      });

      if (restartSpin) resumeSpin();
    };

    const enterTarget = (target: Element) => {
      if (activeTarget === target) return;
      if (activeTarget) leaveTarget(false);
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      activeTarget = target;
      cursor.dataset.targetState = "active";
      spinTimelineRef.current?.pause();
      gsap.killTweensOf(cursor, "rotation");
      gsap.set(cursor, { rotation: 0 });

      if (cursorColorOnTarget) {
        gsap.to(corners, {
          borderColor: cursorColorOnTarget,
          duration: 0.15,
          ease: "power2.out",
          overwrite: true,
        });
        gsap.to(dot, {
          backgroundColor: cursorColorOnTarget,
          duration: 0.15,
          ease: "power2.out",
          overwrite: true,
        });
      }

      updateTargetGeometry();
      gsap.killTweensOf(activeStrength);
      gsap.set(activeStrength, { current: 0 });
      gsap.to(activeStrength, {
        current: 1,
        duration: hoverDuration,
        ease: "power2.out",
        overwrite: true,
      });
      addTicker();
      ticker();
    };

    const pointerMoveHandler = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      cursorXTo(pointer.x - containingBlockOffset.x);
      cursorYTo(pointer.y - containingBlockOffset.y);
    };

    const pointerOverHandler = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest(targetSelector);
      if (target) enterTarget(target);
    };

    const pointerOutHandler = (event: PointerEvent) => {
      if (!activeTarget) return;
      const nextNode = event.relatedTarget;
      if (nextNode instanceof Node && activeTarget.contains(nextNode)) return;
      const nextTarget =
        nextNode instanceof Element ? nextNode.closest(targetSelector) : null;
      if (nextTarget === activeTarget) return;
      leaveTarget();
    };

    const scrollHandler = () => {
      if (containingBlock) {
        containingBlockOffset = getContainingBlockOffset(containingBlock);
        cursorXTo(pointer.x - containingBlockOffset.x);
        cursorYTo(pointer.y - containingBlockOffset.y);
      }
      if (!activeTarget) return;

      scheduleTargetGeometry();
      const elementUnderPointer = document.elementFromPoint(pointer.x, pointer.y);
      if (elementUnderPointer?.closest(targetSelector) !== activeTarget) {
        leaveTarget();
      }
    };

    const resizeHandler = () => {
      updateContainingBlock();
      cursorXTo(pointer.x - containingBlockOffset.x);
      cursorYTo(pointer.y - containingBlockOffset.y);
      scheduleTargetGeometry();
    };

    const layoutHandler = () => scheduleTargetGeometry();

    const pointerDownHandler = () => {
      gsap.to(dot, { scale: 0.7, duration: 0.18, overwrite: true });
      gsap.to(cursor, { scale: 0.9, duration: 0.16, overwrite: true });
    };

    const pointerUpHandler = () => {
      gsap.to(dot, { scale: 1, duration: 0.18, overwrite: true });
      gsap.to(cursor, { scale: 1, duration: 0.16, overwrite: true });
    };

    createSpinTimeline();

    window.addEventListener("pointermove", pointerMoveHandler, { passive: true });
    window.addEventListener("pointerover", pointerOverHandler, { passive: true });
    window.addEventListener("pointerout", pointerOutHandler, { passive: true });
    window.addEventListener("pointerdown", pointerDownHandler, { passive: true });
    window.addEventListener("pointerup", pointerUpHandler, { passive: true });
    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("resize", resizeHandler, { passive: true });
    window.addEventListener("portfolio:layout-change", layoutHandler);

    return () => {
      window.removeEventListener("pointermove", pointerMoveHandler);
      window.removeEventListener("pointerover", pointerOverHandler);
      window.removeEventListener("pointerout", pointerOutHandler);
      window.removeEventListener("pointerdown", pointerDownHandler);
      window.removeEventListener("pointerup", pointerUpHandler);
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("portfolio:layout-change", layoutHandler);

      removeTicker();
      if (targetGeometryFrame) window.cancelAnimationFrame(targetGeometryFrame);
      if (resumeTimeout) clearTimeout(resumeTimeout);
      spinTimelineRef.current?.kill();
      spinTimelineRef.current = null;
      gsap.killTweensOf([cursor, dot, ...corners, activeStrength]);
      document.body.style.cursor = originalCursor;
      document.body.classList.remove("target-cursor-active");
    };
  }, [
    canUseCursor,
    cursorColor,
    cursorColorOnTarget,
    hideDefaultCursor,
    hoverDuration,
    parallaxOn,
    spinDuration,
    targetSelector,
  ]);

  if (!canUseCursor) return null;

  return (
    <div
      ref={cursorRef}
      className="target-cursor-wrapper"
      aria-hidden="true"
      data-target-cursor
      data-target-state="idle"
    >
      <div
        ref={dotRef}
        className="target-cursor-dot"
        style={{ backgroundColor: cursorColor }}
      />
      <div className="target-cursor-corner corner-tl" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-tr" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-br" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-bl" style={{ borderColor: cursorColor }} />
    </div>
  );
};

export default TargetCursor;
