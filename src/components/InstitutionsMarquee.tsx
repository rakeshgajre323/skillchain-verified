import { useEffect, useState } from "react";
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

// Default fallback list (bundled assets) — used until the DB-managed
// list loads or if the user hasn't configured any logos yet.
const FALLBACK_LOGOS: Logo[] = [
  { name: "Indian Institute of Technology, Delhi", small: iitD128, large: iitD224, website_url: "https://www.iitd.ac.in" },
  { name: "Indian Institute of Technology, Bombay", small: iitB128, large: iitB224, website_url: "https://www.iitb.ac.in" },
  { name: "Jawaharlal Nehru Technological University, Hyderabad", small: jntuh128, large: jntuh224, website_url: "https://jntuh.ac.in" },
  { name: "Osmania University", small: ou128, large: ou224, website_url: "https://www.osmania.ac.in" },
  { name: "University of Delhi", small: du128, large: du224, website_url: "https://www.du.ac.in" },
  { name: "Lovely Professional University", small: lpu128, large: lpu224, website_url: "https://www.lpu.in" },
];

export function InstitutionsMarquee() {
  const [logos, setLogos] = useState<Logo[]>(FALLBACK_LOGOS);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  // Pull the admin-managed list (falls back to bundled defaults on error/empty)
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

        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] gap-6 sm:gap-10 md:gap-14 lg:gap-16">
          {loop.map((inst, i) => {
            const eager = i < logos.length;
            const isLoaded = loaded[inst.small];
            const Wrapper = inst.website_url
              ? ({ children }: { children: React.ReactNode }) => (
                  <a
                    href={inst.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
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
