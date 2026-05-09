import { useEffect, useState } from "react";
import { Award, CheckCircle2, Gauge, Pause, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type Speed = "slow" | "normal" | "fast";

const SPEED_SECONDS: Record<Speed, number> = {
  slow: 8,
  normal: 5,
  fast: 2.5,
};

/**
 * Animated illustration showing a professor (institute) issuing a certificate
 * to a student. Pure CSS/SVG — no external assets, fully themed.
 *
 * Includes user controls for animation speed and play/pause, and automatically
 * downshifts to a slower speed (or honors prefers-reduced-motion) on small
 * screens so it isn't visually overwhelming on mobile.
 */
export function IssuanceAnimation() {
  const [speed, setSpeed] = useState<Speed>("normal");
  const [playing, setPlaying] = useState(true);
  const [autoLimited, setAutoLimited] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 640px)");

    const apply = () => {
      if (reduced.matches || reduceMotion) {
        setPlaying(false);
        setAutoLimited(true);
      } else if (small.matches) {
        setSpeed("slow");
        setAutoLimited(true);
      } else {
        setAutoLimited(false);
      }
    };
    apply();
    reduced.addEventListener("change", apply);
    small.addEventListener("change", apply);
    return () => {
      reduced.removeEventListener("change", apply);
      small.removeEventListener("change", apply);
    };
  }, [reduceMotion]);

  const seconds = SPEED_SECONDS[speed];
  const playState = playing ? "running" : "paused";

  return (
    <section
      className="py-20 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden"
      style={
        {
          ["--ic-duration" as string]: `${seconds}s`,
          ["--ic-bob-duration" as string]: `${Math.max(2, seconds * 0.8)}s`,
          ["--ic-sparkle-duration" as string]: `${Math.max(1.2, seconds * 0.5)}s`,
          ["--ic-play" as string]: playState,
        } as React.CSSProperties
      }
    >
      <style>{`
        @keyframes ic-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes ic-bob-delay { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        @keyframes ic-cert-fly {
          0%   { transform: translate(0, 0) rotate(-6deg) scale(1);   opacity: 0; }
          15%  { opacity: 1; }
          50%  { transform: translate(calc(var(--ic-fly) * 0.5), -22px) rotate(0deg) scale(1.06); }
          85%  { transform: translate(var(--ic-fly), 0) rotate(6deg) scale(1); opacity: 1; }
          100% { transform: translate(var(--ic-fly), 0) rotate(6deg) scale(1); opacity: 0; }
        }
        @keyframes ic-arm-give {
          0%,100% { transform: rotate(0deg); }
          40%, 70% { transform: rotate(-22deg); }
        }
        @keyframes ic-arm-receive {
          0%,100% { transform: rotate(0deg); }
          50%, 85% { transform: rotate(20deg); }
        }
        @keyframes ic-sparkle {
          0%,100% { opacity: 0; transform: scale(0.6) }
          50% { opacity: 1; transform: scale(1) }
        }
        @keyframes ic-stamp-pop {
          0%, 60% { opacity: 0; transform: scale(0.4) rotate(-12deg); }
          70% { opacity: 1; transform: scale(1.2) rotate(-12deg); }
          85%,100% { opacity: 1; transform: scale(1) rotate(-12deg); }
        }
        @keyframes ic-line-pulse {
          0% { stroke-dashoffset: 60; opacity: 0; }
          30% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.4; }
        }
        .ic-bob { animation: ic-bob var(--ic-bob-duration) ease-in-out infinite; animation-play-state: var(--ic-play); }
        .ic-bob-delay { animation: ic-bob-delay var(--ic-bob-duration) ease-in-out infinite 0.6s; animation-play-state: var(--ic-play); }
        .ic-cert { animation: ic-cert-fly var(--ic-duration) ease-in-out infinite; transform-origin: center; animation-play-state: var(--ic-play); }
        .ic-arm-give { animation: ic-arm-give var(--ic-duration) ease-in-out infinite; transform-origin: 50% 8%; animation-play-state: var(--ic-play); }
        .ic-arm-receive { animation: ic-arm-receive var(--ic-duration) ease-in-out infinite; transform-origin: 50% 8%; animation-play-state: var(--ic-play); }
        .ic-sparkle { animation: ic-sparkle var(--ic-sparkle-duration) ease-in-out infinite; animation-play-state: var(--ic-play); }
        .ic-stamp { animation: ic-stamp-pop var(--ic-duration) ease-in-out infinite; transform-origin: center; animation-play-state: var(--ic-play); }
        .ic-line { stroke-dasharray: 60; animation: ic-line-pulse var(--ic-duration) ease-in-out infinite; animation-play-state: var(--ic-play); }

        /* Responsive flight distance — matches the path width on each breakpoint */
        .ic-stage { --ic-fly: 110px; }
        @media (min-width: 480px) { .ic-stage { --ic-fly: 160px; } }
        @media (min-width: 768px) { .ic-stage { --ic-fly: 240px; } }
      `}</style>

      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            How Issuance Works
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            From Institute to Student — Instantly
          </h2>
          <p className="text-muted-foreground">
            Watch how a professor issues a verified certificate that lands directly in the student's secure dashboard.
          </p>
        </div>

        {/* Animation controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card/60 backdrop-blur-sm p-1">
            <Gauge className="h-4 w-4 text-muted-foreground ml-2 mr-1" aria-hidden="true" />
            {(["slow", "normal", "fast"] as Speed[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={speed === s ? "default" : "ghost"}
                className="rounded-full h-7 px-3 text-xs capitalize"
                onClick={() => setSpeed(s)}
                aria-pressed={speed === s}
                disabled={reduceMotion}
              >
                {s}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-9"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause animation" : "Play animation"}
            disabled={reduceMotion}
          >
            {playing ? <Pause className="h-4 w-4 mr-1.5" /> : <Play className="h-4 w-4 mr-1.5" />}
            {playing ? "Pause" : "Play"}
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur-sm px-3 py-1.5">
            <Switch
              id="reduce-motion"
              checked={reduceMotion}
              onCheckedChange={setReduceMotion}
              aria-label="Reduce motion"
            />
            <label htmlFor="reduce-motion" className="text-xs text-muted-foreground cursor-pointer select-none">
              Reduce motion
            </label>
          </div>
          {autoLimited && !reduceMotion && (
            <span className="text-xs text-muted-foreground ml-1">
              Auto-adjusted for your device
            </span>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-sm p-3 sm:p-6 md:p-10 max-w-5xl mx-auto relative overflow-hidden ic-stage">
          {/* soft glow background */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(circle_at_70%_50%,hsl(var(--accent)/0.08),transparent_60%)]" />

          <div className="relative grid grid-cols-[auto_1fr_auto] items-end gap-1 sm:gap-3 md:gap-4">
            {/* PROFESSOR */}
            <div className="flex flex-col items-center">
              <div className="ic-bob w-20 sm:w-28 md:w-[150px]">
                <Professor />
              </div>
              <div className="mt-2 sm:mt-4 text-center">
                <p className="font-semibold text-xs sm:text-sm">Prof. Institute</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Issuer</p>
              </div>
            </div>

            {/* CERTIFICATE FLIGHT PATH */}
            <div className="relative h-32 sm:h-44 md:h-56 w-full flex items-center justify-center">
              {/* dashed connection line */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 280 200"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M 10 150 Q 140 40 270 150"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  className="ic-line"
                  opacity="0.5"
                />
              </svg>

              {/* flying certificate */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 ic-cert scale-75 sm:scale-90 md:scale-100 origin-left">
                <Certificate />
              </div>

              {/* sparkles */}
              <Sparkles className="absolute left-1/4 top-2 h-3 w-3 sm:h-4 sm:w-4 text-primary ic-sparkle" />
              <Sparkles
                className="absolute right-1/4 top-6 h-3 w-3 text-accent ic-sparkle"
                style={{ animationDelay: "0.6s" }}
              />
              <Sparkles
                className="absolute left-1/2 bottom-6 h-3 w-3 text-primary ic-sparkle"
                style={{ animationDelay: "1.2s" }}
              />
            </div>

            {/* STUDENT */}
            <div className="flex flex-col items-center">
              <div className="ic-bob-delay w-20 sm:w-28 md:w-[150px]">
                <Student />
              </div>
              <div className="mt-2 sm:mt-4 text-center">
                <p className="font-semibold text-xs sm:text-sm">Student</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Recipient</p>
              </div>
            </div>
          </div>

          {/* Steps strip */}
          <div className="relative mt-10 grid grid-cols-3 gap-3 max-w-3xl mx-auto text-center text-xs">
            <div className="p-3 rounded-xl bg-background/60 border border-border">
              <Award className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-medium">Institute issues</p>
            </div>
            <div className="p-3 rounded-xl bg-background/60 border border-border">
              <Sparkles className="h-4 w-4 text-accent mx-auto mb-1" />
              <p className="font-medium">Verified & signed</p>
            </div>
            <div className="p-3 rounded-xl bg-background/60 border border-border">
              <CheckCircle2 className="h-4 w-4 text-success mx-auto mb-1" />
              <p className="font-medium">In student dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- SVG Characters ---------- */

function Professor() {
  return (
    <svg viewBox="0 0 150 200" className="w-full h-auto" aria-hidden="true">
      {/* shadow */}
      <ellipse cx="75" cy="190" rx="42" ry="5" fill="hsl(var(--foreground))" opacity="0.08" />
      {/* body / robe */}
      <path
        d="M40 185 L45 110 Q75 95 105 110 L110 185 Z"
        fill="hsl(var(--primary))"
      />
      {/* robe trim */}
      <path d="M65 110 L75 185 L85 110 Z" fill="hsl(var(--primary-foreground))" opacity="0.25" />
      {/* neck */}
      <rect x="68" y="80" width="14" height="14" fill="#e4b48c" />
      {/* head */}
      <circle cx="75" cy="65" r="22" fill="#f1c8a3" />
      {/* glasses */}
      <circle cx="67" cy="65" r="5" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
      <circle cx="83" cy="65" r="5" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
      <line x1="72" y1="65" x2="78" y2="65" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
      {/* smile */}
      <path d="M68 74 Q75 78 82 74" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* hair / beard */}
      <path d="M55 60 Q60 35 75 35 Q90 35 95 60 Q90 50 75 50 Q60 50 55 60 Z" fill="#5a4a3a" />
      <path d="M60 75 Q65 88 75 90 Q85 88 90 75 Q85 80 75 80 Q65 80 60 75 Z" fill="#dcdcdc" />
      {/* graduation cap */}
      <rect x="50" y="32" width="50" height="6" fill="hsl(var(--foreground))" />
      <polygon points="35,32 75,18 115,32 75,42" fill="hsl(var(--foreground))" />
      <circle cx="75" cy="25" r="2" fill="hsl(var(--accent))" />
      <line x1="75" y1="27" x2="105" y2="38" stroke="hsl(var(--accent))" strokeWidth="1.5" />
      <circle cx="105" cy="40" r="2.5" fill="hsl(var(--accent))" />
      {/* arm — animated giving */}
      <g className="ic-arm-give">
        <rect x="100" y="115" width="10" height="35" rx="5" fill="hsl(var(--primary))" />
        <circle cx="105" cy="152" r="7" fill="#f1c8a3" />
      </g>
      {/* other arm static */}
      <rect x="40" y="115" width="10" height="35" rx="5" fill="hsl(var(--primary))" />
      <circle cx="45" cy="152" r="6" fill="#f1c8a3" />
    </svg>
  );
}

function Student() {
  return (
    <svg viewBox="0 0 150 200" className="w-full h-auto" aria-hidden="true">
      <ellipse cx="75" cy="190" rx="42" ry="5" fill="hsl(var(--foreground))" opacity="0.08" />
      {/* body / hoodie */}
      <path d="M40 185 L48 115 Q75 105 102 115 L110 185 Z" fill="hsl(var(--accent))" />
      {/* hoodie pocket */}
      <rect x="60" y="140" width="30" height="18" rx="3" fill="hsl(var(--accent))" opacity="0.6" stroke="hsl(var(--foreground))" strokeOpacity="0.15" />
      {/* neck */}
      <rect x="68" y="80" width="14" height="14" fill="#d9a07a" />
      {/* head */}
      <circle cx="75" cy="65" r="22" fill="#ecc19a" />
      {/* hair */}
      <path d="M53 58 Q55 35 75 35 Q95 35 97 58 Q90 48 75 48 Q60 48 53 58 Z" fill="#3a2a1f" />
      {/* eyes */}
      <circle cx="68" cy="64" r="2" fill="hsl(var(--foreground))" />
      <circle cx="82" cy="64" r="2" fill="hsl(var(--foreground))" />
      {/* big smile */}
      <path d="M65 73 Q75 82 85 73" stroke="hsl(var(--foreground))" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* backpack strap */}
      <rect x="44" y="115" width="6" height="55" fill="hsl(var(--foreground))" opacity="0.35" />
      {/* arm — animated receiving */}
      <g className="ic-arm-receive">
        <rect x="40" y="115" width="10" height="35" rx="5" fill="hsl(var(--accent))" />
        <circle cx="45" cy="152" r="7" fill="#ecc19a" />
      </g>
      {/* other arm */}
      <rect x="100" y="115" width="10" height="35" rx="5" fill="hsl(var(--accent))" />
      <circle cx="105" cy="152" r="6" fill="#ecc19a" />
    </svg>
  );
}

function Certificate() {
  return (
    <svg width="90" height="64" viewBox="0 0 90 64" aria-hidden="true">
      {/* paper */}
      <rect x="2" y="2" width="86" height="60" rx="4" fill="#fffdf7" stroke="hsl(var(--primary))" strokeWidth="2" />
      {/* header bar */}
      <rect x="2" y="2" width="86" height="10" rx="4" fill="hsl(var(--primary))" />
      {/* title line */}
      <rect x="14" y="20" width="62" height="3" rx="1.5" fill="hsl(var(--foreground))" opacity="0.8" />
      {/* sub lines */}
      <rect x="20" y="28" width="50" height="2" rx="1" fill="hsl(var(--muted-foreground))" />
      <rect x="24" y="34" width="42" height="2" rx="1" fill="hsl(var(--muted-foreground))" />
      <rect x="22" y="40" width="46" height="2" rx="1" fill="hsl(var(--muted-foreground))" />
      {/* signature line */}
      <line x1="14" y1="52" x2="40" y2="52" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.5" />
      {/* seal/stamp */}
      <g className="ic-stamp" style={{ transformOrigin: "70px 50px" }}>
        <circle cx="70" cy="50" r="9" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5" />
        <circle cx="70" cy="50" r="6" fill="hsl(var(--accent))" opacity="0.85" />
        <text x="70" y="52" textAnchor="middle" fontSize="6" fontWeight="700" fill="hsl(var(--accent-foreground))">
          ✓
        </text>
      </g>
    </svg>
  );
}
