import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Shield,
  Award,
  Users,
  Building2,
  GraduationCap,
  Globe,
  Lock,
  CheckCircle2,
  QrCode,
  BarChart3,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              About <span className="text-primary">Appar ID</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Appar ID is a modern digital credential management platform that enables students, 
              educational institutes, and companies to issue, manage, and verify credentials 
              securely — all in one place.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-10">
            <h2 className="text-3xl font-bold text-center">What We Do</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center space-y-3">
                  <GraduationCap className="h-10 w-10 mx-auto text-primary" />
                  <h3 className="font-semibold text-lg">For Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Store, view, and share your digital certificates and credentials. 
                    Generate QR codes for instant verification by employers or institutions.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center space-y-3">
                  <Building2 className="h-10 w-10 mx-auto text-primary" />
                  <h3 className="font-semibold text-lg">For Institutes</h3>
                  <p className="text-sm text-muted-foreground">
                    Issue tamper-proof digital credentials to students. Access an admin 
                    dashboard with analytics on user growth and certificate issuance trends.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center space-y-3">
                  <Users className="h-10 w-10 mx-auto text-primary" />
                  <h3 className="font-semibold text-lg">For Companies</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify candidate credentials instantly. Browse and filter certificates 
                    by issuer, status, or date to streamline your hiring process.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto space-y-10">
            <h2 className="text-3xl font-bold text-center">Platform Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Secure Authentication",
                  desc: "Email-based signup with OTP verification, password reset, and role-based access control for students, institutes, and companies.",
                },
                {
                  icon: Award,
                  title: "Credential Management",
                  desc: "Issue, edit, and manage digital certificates with details like issuer name, issue date, expiry, and verification status.",
                },
                {
                  icon: QrCode,
                  title: "QR Code Verification",
                  desc: "Each certificate includes a scannable QR code linking to its verification page for instant authenticity checks.",
                },
                {
                  icon: BarChart3,
                  title: "Admin Dashboard",
                  desc: "Institutes and companies get analytics with charts for user growth, certificate issuance trends, and status distribution.",
                },
                {
                  icon: Search,
                  title: "Advanced Filtering",
                  desc: "Search and filter credentials by issuer name, verification status, or date range to find exactly what you need.",
                },
                {
                  icon: Lock,
                  title: "Privacy & Security",
                  desc: "Row-level security ensures users only see their own data. All sensitive operations are protected server-side.",
                },
                {
                  icon: Globe,
                  title: "Responsive Design",
                  desc: "Fully responsive UI with dark/light theme support, built with modern web technologies for a seamless experience on any device.",
                },
                {
                  icon: CheckCircle2,
                  title: "Real-Time Updates",
                  desc: "Edit credential details inline — changes save directly to the database and reflect immediately across the platform.",
                },
              ].map((feature) => (
                <Card key={feature.title} className="border-border/50">
                  <CardContent className="pt-6 space-y-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl font-bold">Built With</h2>
            <p className="text-muted-foreground">
              Appar ID is built using a modern, production-ready tech stack:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "React",
                "TypeScript",
                "Tailwind CSS",
                "Vite",
                "Lovable Cloud",
                "Recharts",
                "React Router",
                "React Hook Form",
                "Zod",
                "shadcn/ui",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
