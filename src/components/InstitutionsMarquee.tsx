import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import lpu128 from "@/assets/institutions/lpu-128.webp";
import lpu224 from "@/assets/institutions/lpu-224.webp";
import ou128 from "@/assets/institutions/ou-128.webp";
import ou224 from "@/assets/institutions/ou-224.webp";
import du128 from "@/assets/institutions/du-128.webp";
import du224 from "@/assets/institutions/du-224.webp";
import iitD128 from "@/assets/institutions/iit_d-128.webp";
import iitD224 from "@/assets/institutions/iit_d-224.webp";
import iitB128 from "@/assets/institutions/iit_b-128.webp";
import iitB224 from "@/assets/institutions/iit_b-224.webp";
import jntuh128 from "@/assets/institutions/jntuh-128.webp";
import jntuh224 from "@/assets/institutions/jntuh-224.webp";

type Logo = { name: string; small: string; large: string; website_url?: string };

const FALLBACK_LOGOS: Logo[] = [
  { name: "Indian Institute of Technology, Delhi", small: iitD128, large: iitD224, website_url: "https://www.iitd.ac.in" },
  { name: "Indian Institute of Technology, Bombay", small: iitB128, large: iitB224, website_url: "https://www.iitb.ac.in" },
  { name: "Jawaharlal Nehru Technological University, Hyderabad", small: jntuh128, large: jntuh224, website_url: "https://jntuh.ac.in" },
  { name: "Osmania University", small: ou128, large: ou224, website_url: "https://www.osmania.ac.in" },
  { name: "University of Delhi", small: du128, large: du224, website_url: "https://www.du.ac.in" },
  { name: "Lovely Professional University", small: lpu128, large: lpu224, website_url: "https://www.lpu.in" },
];

const DRAG_THRESHOLD = 6; // px before a press becomes a drag
const FRICTION = 0.94; // per-frame velocity decay (~60fps)
const MIN_VELOCITY = 0.05; // px/ms to stop the fling
const VELOCITY_SAMPLE_MS = 80; // window for swipe-speed sampling

export function InstitutionsMarquee() {
  const [logos, setLogos] = useState<Logo[]>(FALLBACK_LOGOS);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("institution_logos")
      .select("name, logo_url, website_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled || error || !data || data.length === 0) return;
        setLogos(
          data.map((row) => ({
            name: row.name,
            small: row.logo_url,
            large: row.logo_url,
            website_url: row.website_url,
          })),
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loop = [...logos, ...logos];

  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    pointerId: null as number | null,
    startX: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0, // px/ms; positive => content moves left (scrollLeft increases)
    startScrollLeft: 0,
    isDragging: false, // true once threshold crossed
    suppressClickUntil: 0,
    samples: [] as { x: number; t: number }[],
  });
  const rafRef = useRef<number | null>(null);
  const autoRafRef = useRef<number | null>(null);
  const pausedRef = useRef(0); // >0 when paused (hover/focus/drag)
  const resumeAtRef = useRef(0); // ms timestamp when auto-scroll may resume after interaction
  const AUTO_SPEED = 0.03; // px/ms (~30 px/s, gentle marquee)
  const RESUME_DELAY_MS = 1500;

  const cancelMomentum = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startMomentum = useCallback(() => {
    cancelMomentum();
    let last = performance.now();
    const tick = (now: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const dt = Math.min(now - last, 32);
      last = now;
      const v = drag.current.velocity;
      if (Math.abs(v) < MIN_VELOCITY) {
        drag.current.velocity = 0;
        rafRef.current = null;
        return;
      }
      el.scrollLeft += v * dt;
      // Stop at edges
      if (el.scrollLeft <= 0 || el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        drag.current.velocity = 0;
        rafRef.current = null;
        return;
      }
      drag.current.velocity = v * Math.pow(FRICTION, dt / 16);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [cancelMomentum]);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Only primary button for mouse
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancelMomentum();
    pause();
    drag.current.pointerId = e.pointerId;
    drag.current.startX = e.clientX;
    drag.current.lastX = e.clientX;
    drag.current.lastT = performance.now();
    drag.current.startScrollLeft = el.scrollLeft;
    drag.current.isDragging = false;
    drag.current.velocity = 0;
    drag.current.samples = [{ x: e.clientX, t: drag.current.lastT }];
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el || drag.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.current.startX;

    if (!drag.current.isDragging) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      drag.current.isDragging = true;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    el.scrollLeft = drag.current.startScrollLeft - dx;

    const now = performance.now();
    drag.current.samples.push({ x: e.clientX, t: now });
    // keep only recent samples
    const cutoff = now - VELOCITY_SAMPLE_MS;
    while (drag.current.samples.length > 2 && drag.current.samples[0].t < cutoff) {
      drag.current.samples.shift();
    }
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
  };

  const finishPointer = (e: React.PointerEvent) => {
    if (drag.current.pointerId !== e.pointerId) return;
    const wasDragging = drag.current.isDragging;
    drag.current.pointerId = null;
    drag.current.isDragging = false;
    resume();

    if (wasDragging) {
      // Suppress the synthetic click that follows a drag so logo links don't trigger
      drag.current.suppressClickUntil = performance.now() + 350;

      // Compute fling velocity from recent samples
      const samples = drag.current.samples;
      if (samples.length >= 2) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          // px/ms; invert because dragging right scrolls content left
          drag.current.velocity = -(last.x - first.x) / dt;
          startMomentum();
        }
      }
    }
    drag.current.samples = [];
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (performance.now() < drag.current.suppressClickUntil) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Keyboard support on the scroller container
  const scrollByAmount = (delta: number, smooth = true) => {
    const el = scrollerRef.current;
    if (!el) return;
    cancelMomentum();
    resumeAtRef.current = performance.now() + RESUME_DELAY_MS;
    el.scrollBy({ left: delta, behavior: smooth ? "smooth" : "auto" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(160, el.clientWidth * 0.6);
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        scrollByAmount(step);
        break;
      case "ArrowLeft":
        e.preventDefault();
        scrollByAmount(-step);
        break;
      case "Home":
        e.preventDefault();
        el.scrollTo({ left: 0, behavior: "smooth" });
        break;
      case "End":
        e.preventDefault();
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
        break;
      case "PageDown":
        e.preventDefault();
        scrollByAmount(el.clientWidth);
        break;
      case "PageUp":
        e.preventDefault();
        scrollByAmount(-el.clientWidth);
        break;
    }
  };

  // Endless auto-scroll when idle. The logo list is duplicated, so we wrap
  // scrollLeft modulo half the scrollWidth to create a seamless loop.
  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const el = scrollerRef.current;
      if (!el) {
        autoRafRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(now - last, 32);
      last = now;
      const canRun =
        pausedRef.current === 0 &&
        rafRef.current === null && // not flinging
        now >= resumeAtRef.current;
      if (canRun) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          let next = el.scrollLeft + AUTO_SPEED * dt;
          if (next >= half) next -= half;
          el.scrollLeft = next;
        }
      }
      autoRafRef.current = requestAnimationFrame(tick);
    };
    autoRafRef.current = requestAnimationFrame(tick);

    // Pause when the tab is hidden (avoids drift / wasted work)
    const onVisibility = () => {
      if (document.hidden) pausedRef.current += 1;
      else pausedRef.current = Math.max(0, pausedRef.current - 1);
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (autoRafRef.current !== null) cancelAnimationFrame(autoRafRef.current);
      autoRafRef.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const pause = () => {
    pausedRef.current += 1;
  };
  const resume = () => {
    pausedRef.current = Math.max(0, pausedRef.current - 1);
    resumeAtRef.current = performance.now() + RESUME_DELAY_MS;
  };

  useEffect(() => () => cancelMomentum(), [cancelMomentum]);

  return (
    <section className="py-10 sm:py-14 md:py-16 bg-card/40 border-y border-border overflow-hidden">
      <div className="container mb-6 sm:mb-8 md:mb-10 text-center">
        <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-primary mb-2 sm:mb-3">
          Trusted Partner Institutions
        </p>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold">
          Powering credentials for India's leading universities
        </h2>
      </div>

      <div className="relative group">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-16 md:w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 md:w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        {/* Prev / Next buttons */}
        <button
          type="button"
          aria-label="Scroll partner logos left"
          onClick={() => {
            const el = scrollerRef.current;
            if (!el) return;
            scrollByAmount(-Math.max(160, el.clientWidth * 0.6));
          }}
          className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-background/90 border border-border shadow-md hover:bg-background hover:shadow-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Scroll partner logos right"
          onClick={() => {
            const el = scrollerRef.current;
            if (!el) return;
            scrollByAmount(Math.max(160, el.clientWidth * 0.6));
          }}
          className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-background/90 border border-border shadow-md hover:bg-background hover:shadow-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollerRef}
          role="region"
          aria-label="Partner institutions, use arrow keys to scroll"
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
          onPointerEnter={(e) => { if (e.pointerType === "mouse") pause(); }}
          onPointerLeave={(e) => { if (e.pointerType === "mouse") resume(); }}
          onFocus={pause}
          onBlur={resume}
          onClickCapture={onClickCapture}
          onKeyDown={onKeyDown}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            touchAction: "pan-y",
            overscrollBehaviorX: "contain",
          }}
          className="w-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        >
          <div className="flex gap-6 sm:gap-10 md:gap-14 lg:gap-16 px-6 sm:px-10 md:px-16">
            {loop.map((inst, i) => {
            const eager = i < logos.length;
            const isLoaded = loaded[inst.small];
            const Wrapper = inst.website_url
              ? ({ children }: { children: React.ReactNode }) => (
                  <a
                    href={inst.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    draggable={false}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
                    title={`${inst.name} — visit website`}
                  >
                    {children}
                  </a>
                )
              : ({ children }: { children: React.ReactNode }) => (
                  <div
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 shrink-0"
                    title={inst.name}
                  >
                    {children}
                  </div>
                );
            return (
              <Wrapper key={`${inst.name}-${i}`}>
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-xl sm:rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center p-2 sm:p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  {!isLoaded && (
                    <div
                      aria-hidden
                      className="absolute inset-2 sm:inset-3 rounded-lg skeleton-shimmer"
                    />
                  )}
                  <img
                    src={inst.small}
                    srcSet={`${inst.small} 128w, ${inst.large} 224w`}
                    sizes="(min-width: 1024px) 112px, (min-width: 768px) 96px, (min-width: 640px) 80px, 64px"
                    width={224}
                    height={224}
                    alt={`${inst.name} logo`}
                    loading={eager ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={eager ? "low" : "auto"}
                    aria-hidden={eager ? undefined : true}
                    draggable={false}
                    onLoad={() =>
                      setLoaded((prev) =>
                        prev[inst.small] ? prev : { ...prev, [inst.small]: true },
                      )
                    }
                    onError={() =>
                      setLoaded((prev) =>
                        prev[inst.small] ? prev : { ...prev, [inst.small]: true },
                      )
                    }
                    className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${
                      isLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground max-w-[7rem] sm:max-w-[9rem] md:max-w-[10rem] text-center line-clamp-2">
                  {inst.name}
                </span>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
