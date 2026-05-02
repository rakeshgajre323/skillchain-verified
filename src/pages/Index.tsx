import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { InstitutionsMarquee } from "@/components/InstitutionsMarquee";
import { useAuth } from "@/hooks/useAuth";
import { getHomeForRole } from "@/lib/roleRoutes";
import {
  Shield,
  CheckCircle2,
  Award,
  Users,
  Building2,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Tamper-Proof Verification",
    description: "Credentials are cryptographically secured and instantly verifiable by anyone.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "You control what you share. Selective disclosure keeps your data private.",
  },
  {
    icon: Globe,
    title: "Globally Recognized",
    description: "Credentials that work across borders, institutions, and platforms.",
  },
  {
    icon: Sparkles,
    title: "Instant Issuance",
    description: "Issue and receive credentials in seconds, not weeks.",
  },
];

const stats = [
  { value: "10K+", label: "Credentials Issued" },
  { value: "500+", label: "Partner Institutions" },
  { value: "50+", label: "Countries" },
  { value: "99.9%", label: "Verification Success" },
];

const roles = [
  {
    icon: GraduationCap,
    title: "For Students",
    description: "Store, manage, and share your academic achievements and skills in one secure place.",
    cta: "Start Learning",
  },
  {
    icon: Building2,
    title: "For Institutes",
    description: "Issue verifiable credentials to your students and alumni with just a few clicks.",
    cta: "Start Issuing",
  },
  {
    icon: Users,
    title: "For Companies",
    description: "Instantly verify candidate credentials and make confident hiring decisions.",
    cta: "Start Hiring",
  },
];

export default function Index() {
  const { user, profile, loading } = useAuth();

  // Send authenticated active users straight to their role-specific home.
  if (!loading && user && profile?.status === "active") {
    return <Navigate to={getHomeForRole(profile.role)} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden hero-gradient">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />

          {/* Animated gradient orbs */}
          <div className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-40 animate-orb-drift"
               style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.55) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-35 animate-float-slow"
               style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.5) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute bottom-0 left-1/3 w-[460px] h-[460px] rounded-full blur-3xl opacity-30 animate-float-reverse"
               style={{ background: "radial-gradient(circle, hsl(var(--ring) / 0.45) 0%, transparent 70%)" }} />

          {/* Slow rotating conic ring */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[820px] rounded-full opacity-20 animate-spin-slow"
               style={{ background: "conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.4) 90deg, transparent 180deg, hsl(var(--accent) / 0.4) 270deg, transparent 360deg)", maskImage: "radial-gradient(circle, transparent 55%, black 60%, transparent 80%)", WebkitMaskImage: "radial-gradient(circle, transparent 55%, black 60%, transparent 80%)" }} />

          {/* Floating accent dots */}
          <div className="pointer-events-none absolute top-24 right-[18%] w-2 h-2 rounded-full bg-primary/70 animate-float-slow" />
          <div className="pointer-events-none absolute bottom-32 left-[12%] w-3 h-3 rounded-full bg-accent/70 animate-float-reverse" />
          <div className="pointer-events-none absolute top-1/2 left-[8%] w-1.5 h-1.5 rounded-full bg-foreground/40 animate-float-slow" />

          <div className="container relative pt-24 pb-20 md:pt-[96px] md:pb-[80px]">
            <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium animate-fade-in border border-primary/20 backdrop-blur-sm hover:bg-primary/15 transition-colors">
                <Sparkles className="h-4 w-4 flex-shrink-0 animate-pulse-slow" />
                <span className="text-balance">Trusted by 500+ institutions worldwide</span>
              </div>

              <h1 className="font-display tracking-tight animate-fade-in-up text-balance">
                Secure, Verifiable{" "}
                <span
                  className="gradient-text font-sans animate-shimmer"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 25%, hsl(var(--ring)) 50%, hsl(var(--accent)) 75%, hsl(var(--primary)) 100%)",
                  }}
                >
                  Digital Certificate
                </span>{" "}
                for Everyone
              </h1>

              <p className="text-lg text-secondary-foreground/90 max-w-2xl mx-auto animate-fade-in-up text-balance" style={{ animationDelay: "0.1s" }}>
                Issue, manage, and verify academic and professional credentials with blockchain-grade security. Empowering students, institutions, and employers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <Link to="/signup" className="w-full sm:w-auto group/cta relative">
                  <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary via-accent to-primary opacity-60 blur-md group-hover/cta:opacity-90 transition-opacity animate-gradient" />
                  <Button variant="hero" className="group relative w-full sm:w-auto">
                    Issue Your First Certificate in 60 Seconds
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/about" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto hover:border-primary hover:text-primary transition-colors">
                    See How Verification Works
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-6 sm:pt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-serif">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-serif">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Free forever plan
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Institutions Marquee */}
        <InstitutionsMarquee />

        {/* Stats Section */}
        <section className="py-[72px] border-y border-border bg-card/50">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-[72px] bg-background">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 font-serif">
                Why Choose CertiVault?
              </h2>
              <p className="text-muted-foreground text-lg">
                Built with cutting-edge technology to ensure your credentials are secure, portable, and universally verifiable.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group surface-card animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold !text-lg !mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-[72px] bg-muted/30">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 font-serif">
                Built for Everyone
              </h2>
              <p className="text-muted-foreground text-lg">
                Whether you're a student, educational institution, or employer, CredVault has the tools you need.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {roles.map((role, index) => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.title}
                    className="relative group p-8 rounded-2xl bg-card border border-border overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative">
                      <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit mb-6">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-display font-bold text-xl mb-3 font-mono">{role.title}</h3>
                      <p className="text-muted-foreground mb-6">{role.description}</p>
                      <Link to="/signup">
                        <Button variant="outline" className="group/btn font-serif">
                          {role.cta}
                          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-[72px] bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-90" />
          <div className="absolute inset-0 bg-hero-pattern opacity-10" />

          <div className="container relative text-center">
            <Award className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 font-serif">
              Ready to Transform Your Credentials?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Join thousands of students, institutions, and employers who trust CredVault for secure credential management.
            </p>
            <Link to="/signup">
              <Button variant="glass" size="xl" className="bg-background/20 hover:bg-background/30 text-primary-foreground border-primary-foreground/20">
                Create Free Account
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
