"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { Project, ProjectSlug } from "@/data/types";
import { getGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type SelectedWorkProps = {
  items: readonly Project[];
  whatsappUrl: string | null;
};

type KillableTimeline = { kill: () => void };

function notifyLayoutChange() {
  window.dispatchEvent(new CustomEvent("portfolio:layout-change"));
}

export function SelectedWork({ items, whatsappUrl }: SelectedWorkProps) {
  const rootRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef(new Map<ProjectSlug, HTMLDivElement>());
  const buttonsRef = useRef(new Map<ProjectSlug, HTMLButtonElement>());
  const rowsRef = useRef(new Map<ProjectSlug, HTMLElement>());
  const activeSlug = useRef<ProjectSlug | null>(null);
  const requestedSlug = useRef<ProjectSlug | null>(null);
  const timelineRef = useRef<KillableTimeline | null>(null);
  const activePreview = useRef<HTMLElement | null>(null);
  const quickX = useRef<((value: number) => void) | null>(null);
  const quickY = useRef<((value: number) => void) | null>(null);
  const quickRotate = useRef<((value: number) => void) | null>(null);
  const lastPointer = useRef({ x: 0, y: 0, time: 0 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
      document.body.removeAttribute("data-expanded-project");
    };
  }, []);

  const setRows = (slug: ProjectSlug | null) => {
    rowsRef.current.forEach((row, rowSlug) => {
      if (slug === null) {
        delete row.dataset.projectActive;
        delete row.dataset.projectDimmed;
      } else if (rowSlug === slug) {
        row.dataset.projectActive = "true";
        delete row.dataset.projectDimmed;
      } else {
        delete row.dataset.projectActive;
        row.dataset.projectDimmed = "true";
      }
    });
  };

  const finishClosed = (slug: ProjectSlug, restoreFocus: boolean) => {
    const panel = panelsRef.current.get(slug);
    const button = buttonsRef.current.get(slug);
    if (!panel || !button) return;

    panel.hidden = true;
    panel.inert = true;
    panel.setAttribute("aria-hidden", "true");
    panel.dataset.expansionState = "closed";
    panel.style.removeProperty("height");
    panel.style.removeProperty("overflow");
    button.setAttribute("aria-expanded", "false");
    if (activeSlug.current === slug) activeSlug.current = null;
    if (document.body.getAttribute("data-expanded-project") === slug) {
      document.body.removeAttribute("data-expanded-project");
    }
    setRows(null);
    notifyLayoutChange();

    if (restoreFocus) {
      button.focus({ preventScroll: true });
      const row = rowsRef.current.get(slug);
      if (row) {
        const top = row.getBoundingClientRect().top + window.scrollY - 82;
        window.dispatchEvent(
          new CustomEvent("portfolio:scroll-to", { detail: { top, immediate: reducedMotion } }),
        );
      }
    }
  };

  const expand = (slug: ProjectSlug) => {
    if (requestedSlug.current !== slug) return;
    const panel = panelsRef.current.get(slug);
    const button = buttonsRef.current.get(slug);
    const row = rowsRef.current.get(slug);
    if (!panel || !button || !row) return;

    activeSlug.current = slug;
    document.body.setAttribute("data-expanded-project", slug);
    setRows(slug);
    panel.hidden = false;
    panel.inert = false;
    panel.setAttribute("aria-hidden", "false");
    panel.dataset.expansionState = "opening";
    button.setAttribute("aria-expanded", "true");

    if (reducedMotion) {
      panel.style.height = "auto";
      panel.style.overflow = "visible";
      panel.dataset.expansionState = "open";
      notifyLayoutChange();
      return;
    }

    const { gsap } = getGsap();
    const parts = panel.querySelectorAll<HTMLElement>("[data-project-detail-part]");
    gsap.set(panel, { display: "block", height: "auto", overflow: "hidden" });
    const targetHeight = panel.scrollHeight;
    gsap.set(panel, { height: 0 });
    gsap.set(parts, { y: 38, opacity: 0 });

    const timeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        if (activeSlug.current !== slug) return;
        panel.style.height = "auto";
        panel.style.overflow = "visible";
        panel.dataset.expansionState = "open";
        notifyLayoutChange();
      },
    });
    timeline
      .to(panel, { height: targetHeight, duration: 0.78, ease: "power4.inOut" })
      .to(parts, { y: 0, opacity: 1, duration: 0.62, stagger: 0.055, ease: "power3.out" }, "-=0.42");
    timelineRef.current = timeline;

    const top = row.getBoundingClientRect().top + window.scrollY - 72;
    window.dispatchEvent(
      new CustomEvent("portfolio:scroll-to", { detail: { top, immediate: false } }),
    );
  };

  const collapse = (
    slug: ProjectSlug,
    restoreFocus: boolean,
    onComplete?: () => void,
  ) => {
    const panel = panelsRef.current.get(slug);
    const button = buttonsRef.current.get(slug);
    if (!panel || !button || panel.hidden) {
      finishClosed(slug, restoreFocus);
      onComplete?.();
      return;
    }

    timelineRef.current?.kill();
    panel.dataset.expansionState = "closing";
    button.setAttribute("aria-expanded", "false");

    if (reducedMotion) {
      finishClosed(slug, restoreFocus);
      onComplete?.();
      return;
    }

    const { gsap } = getGsap();
    const parts = panel.querySelectorAll<HTMLElement>("[data-project-detail-part]");
    gsap.set(panel, { height: panel.getBoundingClientRect().height, overflow: "hidden" });
    const timeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        finishClosed(slug, restoreFocus);
        onComplete?.();
      },
    });
    timeline
      .to(parts, { y: 20, opacity: 0, duration: 0.24, stagger: 0.018, ease: "power2.in" })
      .to(panel, { height: 0, duration: 0.62, ease: "power4.inOut" }, "-=0.1");
    timelineRef.current = timeline;
  };

  const requestOpen = (slug: ProjectSlug) => {
    requestedSlug.current = slug;
    const current = activeSlug.current;
    if (current === slug) return;

    if (current) {
      collapse(current, false, () => {
        if (requestedSlug.current === slug) expand(slug);
      });
    } else {
      expand(slug);
    }
  };

  const requestClose = (slug: ProjectSlug) => {
    requestedSlug.current = null;
    if (activeSlug.current === slug) collapse(slug, true);
  };

  const handlePreviewEnter = (slug: ProjectSlug, event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const preview = previewRef.current;
    const next = preview?.querySelector<HTMLElement>(`[data-preview-image="${slug}"]`);
    if (!preview || !next) return;

    const { gsap } = getGsap();
    if (activePreview.current && activePreview.current !== next) {
      gsap.to(activePreview.current, { opacity: 0, scale: 0.94, duration: 0.24, overwrite: true });
    }
    activePreview.current = next;
    preview.dataset.previewActive = slug;
    gsap.set(preview, { x: event.clientX, y: event.clientY, xPercent: -50, yPercent: -50 });
    lastPointer.current = {
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
    };
    quickX.current = gsap.quickTo(preview, "x", { duration: 0.48, ease: "power3.out" });
    quickY.current = gsap.quickTo(preview, "y", { duration: 0.48, ease: "power3.out" });
    quickRotate.current = gsap.quickTo(preview, "rotation", { duration: 0.42, ease: "power3.out" });
    gsap.fromTo(
      next,
      { opacity: 0, scale: 0.82, clipPath: "circle(12% at 50% 50%)" },
      { opacity: 1, scale: 1, clipPath: "circle(71% at 50% 50%)", duration: 0.48, ease: "power3.out", overwrite: true },
    );
    window.dispatchEvent(
      new CustomEvent("portfolio:project-hover", { detail: { active: true, slug } }),
    );
  };

  const handlePreviewLeave = useCallback(() => {
    const preview = previewRef.current;
    if (!preview || !activePreview.current) return;
    const { gsap } = getGsap();
    gsap.to(activePreview.current, {
      opacity: 0,
      scale: 0.94,
      rotation: 0,
      duration: 0.32,
      ease: "power3.out",
      overwrite: true,
    });
    delete preview.dataset.previewActive;
    activePreview.current = null;
    quickX.current = null;
    quickY.current = null;
    quickRotate.current = null;
    window.dispatchEvent(
      new CustomEvent("portfolio:project-hover", { detail: { active: false } }),
    );
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let checkFrame = 0;
    const dismissOutsideProjectRow = () => {
      checkFrame = 0;
      const preview = previewRef.current;
      if (!preview || !activePreview.current) return;

      const { x, y } = lastPointer.current;
      const rootBounds = root.getBoundingClientRect();
      const hovered = document.elementFromPoint(x, y);
      const row = hovered?.closest<HTMLElement>("[data-project-row]");
      const rowSlug = row?.dataset.projectRow;
      const insideRoot =
        x >= rootBounds.left &&
        x <= rootBounds.right &&
        y >= rootBounds.top &&
        y <= rootBounds.bottom;

      if (
        !insideRoot ||
        !row ||
        !root.contains(row) ||
        rowSlug !== preview.dataset.previewActive
      ) {
        handlePreviewLeave();
      }
    };
    const scheduleCheck = () => {
      if (!activePreview.current || checkFrame) return;
      checkFrame = window.requestAnimationFrame(dismissOutsideProjectRow);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) handlePreviewLeave();
      },
      { threshold: 0 },
    );

    observer.observe(root);
    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck, { passive: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(checkFrame);
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
    };
  }, [handlePreviewLeave]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!activePreview.current) return;
    const now = event.timeStamp;
    const elapsed = Math.max(16, now - lastPointer.current.time);
    const velocity = (event.clientX - lastPointer.current.x) / elapsed;
    lastPointer.current = { x: event.clientX, y: event.clientY, time: now };
    quickX.current?.(event.clientX);
    quickY.current?.(event.clientY);
    quickRotate.current?.(Math.max(-4, Math.min(4, velocity * 3.4)));
  };

  return (
    <section
      id="selected-work"
      className="selected-work"
      aria-labelledby="selected-work-title"
      ref={rootRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePreviewLeave}
    >
      <div className="section-heading section-heading--work">
        <p>Selected work</p>
        <p>Seven digital experiences / Scroll through</p>
      </div>
      <div className="selected-work__intro">
        <h2 id="selected-work-title">Work built to move people — and business.</h2>
        <p>
          E-commerce, AI, hospitality and business experiences shaped through design,
          code and deliberate motion.
        </p>
      </div>

      <div className="project-index" data-project-index data-scroll-driven="stack">
        {items.map((project, projectIndex) => {
          const panelId = `project-panel-${project.slug}`;
          const headingId = `project-heading-${project.slug}`;
          const palette = {
            "--project-bg": project.palette.background,
            "--project-fg": project.palette.foreground,
            "--project-accent": project.palette.accent,
            "--project-stack-offset": `${projectIndex * 0.34}rem`,
          } as CSSProperties;

          return (
            <article
              className="project-row"
              key={project.slug}
              data-project-row={project.slug}
              data-project-order={projectIndex + 1}
              data-work-item={project.slug}
              style={palette}
              ref={(node) => {
                if (node) rowsRef.current.set(project.slug, node);
              }}
              onPointerEnter={(event) => handlePreviewEnter(project.slug, event)}
            >
              <div className="project-row__summary">
                <span className="project-row__index">{String(projectIndex + 1).padStart(2, "0")}</span>
                <div className="project-row__identity">
                  <h3 id={headingId} className="project-row__title">
                    <span>{project.title[0]}</span>
                    <span>{project.title[1]}</span>
                  </h3>
                  <p className="project-row__category">{project.category}</p>
                </div>
                <p className="project-row__description">{project.shortDescription}</p>
                <div className="project-row__actions">
                  <button
                    type="button"
                    className="project-row__explore"
                    aria-expanded="false"
                    aria-controls={panelId}
                    data-project-expand={project.slug}
                    data-cursor="project"
                    data-cursor-label="Explore"
                    ref={(node) => {
                      if (node) buttonsRef.current.set(project.slug, node);
                    }}
                    onClick={() => requestOpen(project.slug)}
                  >
                    Explore project <span aria-hidden="true">↓</span>
                  </button>
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-project-contact={project.slug}
                      data-cursor="whatsapp"
                      data-cursor-label="Open ↗"
                    >
                      Start something similar <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
                <figure className="project-row__cover" aria-hidden="true">
                  <Image
                    src={project.cover.src}
                    alt=""
                    width={project.cover.width}
                    height={project.cover.height}
                    sizes="(max-width: 767px) 94vw, 28vw"
                    priority={projectIndex === 0}
                  />
                </figure>
              </div>

              <div
                id={panelId}
                className="project-inline"
                role="region"
                aria-labelledby={headingId}
                aria-hidden="true"
                data-project-panel={project.slug}
                data-expansion-state="closed"
                style={palette}
                hidden
                inert
                ref={(node) => {
                  if (node) panelsRef.current.set(project.slug, node);
                }}
              >
                <div className="project-inline__inner">
                  <header className="project-inline__header" data-project-detail-part>
                    <span>Inside the project</span>
                    <p>{project.role}</p>
                  </header>

                  <div className="project-inline__overview" data-project-detail-part>
                    <p>{project.category}</p>
                    <p>{project.longDescription}</p>
                  </div>

                  <figure className="project-inline__hero" data-project-detail-part>
                    <Image
                      src={project.cover.src}
                      alt={project.cover.alt}
                      width={project.cover.width}
                      height={project.cover.height}
                      sizes="(max-width: 767px) 100vw, 94vw"
                    />
                    <figcaption>
                      <span>{project.cover.label}</span>
                      {project.cover.note ? <span>{project.cover.note}</span> : null}
                    </figcaption>
                  </figure>

                  <div className="project-inline__capabilities" data-project-detail-part>
                    <p>What the experience includes</p>
                    <ul>
                      {project.capabilities.map((capability, capabilityIndex) => (
                        <li key={capability} data-project-capability>
                          <span>{String(capabilityIndex + 1).padStart(2, "0")}</span>
                          <span>{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {project.media.length > 1 ? (
                    <div className="project-inline__gallery" data-project-detail-part>
                      {project.media.slice(1, 5).map((media, mediaIndex) => (
                        <figure key={media.src} className={mediaIndex === 0 ? "is-wide" : undefined}>
                          <Image
                            src={media.src}
                            alt={media.alt}
                            width={media.width}
                            height={media.height}
                            sizes="(max-width: 767px) 100vw, 48vw"
                          />
                          <figcaption>
                            <span>{media.label}</span>
                            {media.note ? <span>{media.note}</span> : null}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : (
                    <div className="project-inline__system" data-project-detail-part aria-hidden="true">
                      <div className="project-inline__system-bar">
                        <span />
                        <span />
                        <span />
                      </div>
                      <div className="project-inline__system-grid">
                        <span>{project.capabilities[0]}</span>
                        <span>{project.capabilities[1]}</span>
                        <span>{project.capabilities[2]}</span>
                      </div>
                    </div>
                  )}

                  <div className="project-inline__footer" data-project-detail-part>
                    <button
                      type="button"
                      data-project-collapse={project.slug}
                      data-cursor="navigation"
                      onClick={() => requestClose(project.slug)}
                    >
                      Back to work <span aria-hidden="true">↑</span>
                    </button>
                    <div>
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-project-live={project.slug}
                          data-cursor="project-live"
                          data-cursor-label="Live ↗"
                        >
                          View live site <span aria-hidden="true">↗</span>
                        </a>
                      ) : null}
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-project-contact={project.slug}
                          data-cursor="whatsapp"
                          data-cursor-label="Open ↗"
                        >
                          {project.contactLabel} <span aria-hidden="true">↗</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="project-hover-preview" ref={previewRef} aria-hidden="true" data-hover-preview>
        {items.map((project) => (
          <span key={project.slug} data-preview-image={project.slug}>
            <Image
              src={project.cover.src}
              alt=""
              width={project.cover.width}
              height={project.cover.height}
              sizes="32vw"
            />
          </span>
        ))}
      </div>
    </section>
  );
}