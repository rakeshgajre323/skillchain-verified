import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden hero-gradient">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />

          <div className="container relative py-24 md:py-32 lg:py-40">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
                <Sparkles className="h-4 w-4" />
                Trusted by 500+ institutions worldwide
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight animate-fade-in-up text-balance">
                Secure, Verifiable{" "}
                <span className="gradient-text">Digital Credentials</span>{" "}
                for Everyone
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up text-balance" style={{ animationDelay: "0.1s" }}>
                Issue, manage, and verify academic and professional credentials with blockchain-grade security. Empowering students, institutions, and employers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <Link to="/signup">
                  <Button variant="hero" size="xl" className="group">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="xl">
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8 pt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Free forever plan
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-border bg-card/50">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
        <section className="py-24 bg-background">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Why Choose SkillChain?
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
                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Built for Everyone
              </h2>
              <p className="text-muted-foreground text-lg">
                Whether you're a student, educational institution, or employer, SkillChain has the tools you need.
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
                      <h3 className="font-display font-bold text-xl mb-3">{role.title}</h3>
                      <p className="text-muted-foreground mb-6">{role.description}</p>
                      <Link to="/signup">
                        <Button variant="outline" className="group/btn">
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
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-90" />
          <div className="absolute inset-0 bg-hero-pattern opacity-10" />

          <div className="container relative text-center">
            <Award className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Transform Your Credentials?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Join thousands of students, institutions, and employers who trust SkillChain for secure credential management.
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
