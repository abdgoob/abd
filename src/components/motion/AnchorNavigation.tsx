"use client";

import { useEffect } from "react";

type ScrollRequest = CustomEvent<{ top: number; immediate?: boolean }>;

function destinationForHash(hash: string) {
  if (!hash || hash === "#") return document.getElementById("home");
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

export function AnchorNavigation() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const updateCurrent = (hash: string) => {
      document.querySelectorAll<HTMLElement>("[data-scroll-nav]").forEach((link) => {
        const target = link.getAttribute("href");
        const current = target === hash || (hash === "" && target === "#home");
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const scrollToHash = (hash: string, immediate = false, focus = false) => {
      const target = destinationForHash(hash);
      if (!target) return;
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      const offset = target.id === "home" || target.id === "main-content"
        ? 0
        : (header?.getBoundingClientRect().height ?? 72) + 12;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
      window.dispatchEvent(
        new CustomEvent("portfolio:scroll-to", { detail: { top, immediate } }) as ScrollRequest,
      );
      updateCurrent(hash);
      if (focus) {
        window.setTimeout(() => {
          if (!(target instanceof HTMLElement)) return;
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }, immediate ? 0 : 450);
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== "/" || !url.hash) return;
      const destination = destinationForHash(url.hash);
      if (!destination) return;

      event.preventDefault();
      if (window.location.hash !== url.hash) {
        window.history.pushState(null, "", url.hash);
      }
      scrollToHash(url.hash, false, anchor.classList.contains("skip-link"));
    };

    const handleHistory = () => scrollToHash(window.location.hash || "#home", false);
    const handleReady = () => {
      if (window.location.hash) scrollToHash(window.location.hash, true);
      else updateCurrent("#home");
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handleHistory);
    window.addEventListener("hashchange", handleHistory);
    window.addEventListener("portfolio:smooth-ready", handleReady);
    window.addEventListener("portfolio:loader-complete", handleReady);
    requestAnimationFrame(handleReady);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handleHistory);
      window.removeEventListener("hashchange", handleHistory);
      window.removeEventListener("portfolio:smooth-ready", handleReady);
      window.removeEventListener("portfolio:loader-complete", handleReady);
    };
  }, []);

  return null;
}