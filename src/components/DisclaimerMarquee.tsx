import { AlertTriangle } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const DISCLAIMER_TEXT =
  "⚠️ Disclaimer: This website is a demonstration/project prototype created for educational and portfolio purposes only. All institution names, logos, statistics, credentials, and information displayed are fictional or used as placeholders. This project is not affiliated with, endorsed by, or connected to any real university, company, organization, or entity unless explicitly stated.";

export function DisclaimerMarquee() {
  const items = Array(8).fill(DISCLAIMER_TEXT);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  // Auto-scroll via JS so it stays in sync with manual scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!paused && !dragging.current && el) {
        el.scrollLeft += dt * 0.06; // speed px/ms
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        if (el.scrollLeft < 0) el.scrollLeft += half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startScroll.current = scrollRef.current?.scrollLeft ?? 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !scrollRef.current) return;
    scrollRef.current.scrollLeft = startScroll.current - (e.clientX - startX.current);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };
  const onWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft += e.deltaY + e.deltaX;
  };

  return (
    <div
      className="w-full bg-destructive border-y border-destructive/60 overflow-hidden py-3 select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        className="overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        <div ref={trackRef} className="flex whitespace-nowrap w-max">
          {items.map((text, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-8 text-sm text-destructive-foreground font-medium"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive-foreground" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
