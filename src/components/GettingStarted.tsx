import { UserPlus, Fingerprint, Download, Share2, ArrowRight } from "lucide-react";

const steps = [
  { icon: UserPlus, label: "Register Yourself", color: "text-primary", bg: "bg-primary/10" },
  { icon: Fingerprint, label: "Verify Yourself", color: "text-destructive", bg: "bg-destructive/10" },
  { icon: Download, label: "Fetch your Documents", color: "text-success", bg: "bg-success/10" },
  { icon: Share2, label: "Share Your Documents", color: "text-accent", bg: "bg-accent/10" },
];

export function GettingStarted() {
  return (
    <section className="py-10 bg-muted/30">
      <div className="container">
        <div className="rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-border p-8 md:p-12">
          <div className="grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold leading-tight">
                Getting started is<br />quick and easy
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 md:gap-2">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex items-center gap-2 md:gap-4">
                    <div
                      className="flex flex-col items-center gap-3 group animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <div
                        className={`relative h-16 w-16 md:h-20 md:w-20 rounded-full bg-background shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 ${step.bg}`}
                      >
                        <span
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 animate-pulse-slow"
                          style={{ boxShadow: `0 0 0 6px hsl(var(--primary) / 0.08)` }}
                          aria-hidden="true"
                        />
                        <Icon className={`h-7 w-7 md:h-8 md:w-8 ${step.color}`} strokeWidth={2.2} />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-foreground text-center max-w-[110px]">
                        {step.label}
                      </span>
                    </div>

                    {i < steps.length - 1 && (
                      <ArrowRight
                        className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground/60 animate-pulse-slow"
                        style={{ animationDelay: `${i * 0.15 + 0.1}s` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
