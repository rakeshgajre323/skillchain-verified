import { useEffect } from "react";

/**
 * Global scroll-reveal controller.
 * Observes any element with [data-reveal] and toggles `.is-visible`
 * once it enters the viewport. Supports `data-reveal-delay="120"` (ms)
 * and `data-reveal="up|down|left|right|fade|zoom"` (default "up").
 *
 * Also auto-staggers direct children of [data-reveal-stagger].
 */
export function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.revealDelay;
            if (delay) el.style.transitionDelay = `${delay}ms`;
            el.classList.add("is-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    const register = (root: ParentNode = document) => {
      // Auto-stagger children
      root.querySelectorAll<HTMLElement>("[data-reveal-stagger]").forEach((parent) => {
        const step = Number(parent.dataset.revealStagger) || 100;
        Array.from(parent.children).forEach((child, i) => {
          const c = child as HTMLElement;
          if (!c.hasAttribute("data-reveal")) c.setAttribute("data-reveal", "up");
          if (!c.hasAttribute("data-reveal-delay")) c.setAttribute("data-reveal-delay", String(i * step));
        });
      });

      root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)").forEach((el) => {
        if (prefersReduced) {
          el.classList.add("is-visible");
          return;
        }
        observer.observe(el);
      });
    };

    register();

    // Watch for route changes / dynamic content
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) register(n as Element);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
