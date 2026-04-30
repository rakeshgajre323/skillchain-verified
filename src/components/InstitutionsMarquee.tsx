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

const institutions = [
  { name: "Indian Institute of Technology, Delhi", small: iitD128, large: iitD224 },
  { name: "Indian Institute of Technology, Bombay", small: iitB128, large: iitB224 },
  { name: "Jawaharlal Nehru Technological University, Hyderabad", small: jntuh128, large: jntuh224 },
  { name: "Osmania University", small: ou128, large: ou224 },
  { name: "University of Delhi", small: du128, large: du224 },
  { name: "Lovely Professional University", small: lpu128, large: lpu224 },
];

export function InstitutionsMarquee() {
  const loop = [...institutions, ...institutions];

  return (
    <section className="py-16 bg-card/40 border-y border-border overflow-hidden">
      <div className="container mb-10 text-center">
        <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-primary mb-3">
          Trusted Partner Institutions
        </p>
        <h2 className="text-2xl md:text-3xl font-display font-bold">
          Powering credentials for India's leading universities
        </h2>
      </div>

      <div className="relative group">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] gap-12 md:gap-16">
          {loop.map((inst, i) => {
            // First copy of each logo loads eagerly so the marquee renders
            // immediately when scrolled into view; the duplicated set lazy-loads.
            const eager = i < institutions.length;
            return (
              <div
                key={`${inst.name}-${i}`}
                className="flex flex-col items-center justify-center gap-3 shrink-0"
                title={inst.name}
              >
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <img
                    src={inst.small}
                    srcSet={`${inst.small} 128w, ${inst.large} 224w`}
                    sizes="(min-width: 768px) 112px, 96px"
                    width={224}
                    height={224}
                    alt={`${inst.name} logo`}
                    loading={eager ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={eager ? "low" : "auto"}
                    aria-hidden={eager ? undefined : true}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="text-xs text-muted-foreground max-w-[10rem] text-center line-clamp-2">
                  {inst.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
