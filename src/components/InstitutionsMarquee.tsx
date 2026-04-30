import lpu from "@/assets/institutions/lpu.jpeg";
import ou from "@/assets/institutions/ou.jpeg";
import du from "@/assets/institutions/du.jpeg";
import iitD from "@/assets/institutions/iit_d.png";
import iitB from "@/assets/institutions/iit_b.png";
import jntuh from "@/assets/institutions/jntuh.jpeg";

const institutions = [
  { name: "Indian Institute of Technology, Delhi", src: iitD },
  { name: "Indian Institute of Technology, Bombay", src: iitB },
  { name: "Jawaharlal Nehru Technological University, Hyderabad", src: jntuh },
  { name: "Osmania University", src: ou },
  { name: "University of Delhi", src: du },
  { name: "Lovely Professional University", src: lpu },
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
          {loop.map((inst, i) => (
            <div
              key={`${inst.name}-${i}`}
              className="flex flex-col items-center justify-center gap-3 shrink-0"
              title={inst.name}
            >
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <img
                  src={inst.src}
                  alt={`${inst.name} logo`}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className="text-xs text-muted-foreground max-w-[10rem] text-center line-clamp-2">
                {inst.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
