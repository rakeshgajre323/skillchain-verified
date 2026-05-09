import { CheckCircle2, IdCard, GraduationCap, Shield } from "lucide-react";
import apaarCard from "@/assets/apaar-card.png";

const highlights = [
  {
    icon: IdCard,
    title: "One Nation, One Student ID",
    description: "A unique 12-digit lifetime ID for every student across India.",
  },
  {
    icon: GraduationCap,
    title: "Unified Academic Record",
    description: "All your academic achievements, marks, and credentials in one place.",
  },
  {
    icon: Shield,
    title: "Government Backed",
    description: "Issued under the Ministry of Education, Government of India.",
  },
];

export function ApaarSection() {
  return (
    <section className="py-[72px] bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30"
           style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-30"
           style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.4) 0%, transparent 70%)" }} />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative animate-fade-in-up order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
            <img
              src={apaarCard}
              alt="APAAR ID - Automated Permanent Academic Account Registry card issued by Ministry of Education"
              className="relative w-full max-w-lg mx-auto hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="space-y-6 animate-fade-in-up order-1 lg:order-2" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <IdCard className="h-4 w-4" />
              <span>APAAR ID</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold font-serif text-balance font-sans">
              What is{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                APAAR ID
              </span>
              ?
            </h2>

            <p className="text-lg text-muted-foreground text-balance font-sans">
              <strong className="text-foreground">APAAR</strong> (Automated Permanent Academic Account Registry) is a
              unique identification system for every student in India. Linked to your Aadhaar, it serves as a
              <strong className="text-foreground"> One Nation, One Student ID</strong> — making it easy to store,
              access, and share academic credentials throughout your lifetime.
            </p>

            <div className="space-y-4">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-4 items-start group animate-fade-in-up"
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Required during signup to link all your credentials securely.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
