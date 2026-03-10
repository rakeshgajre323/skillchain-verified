import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Shield,
  Award,
  Users,
  QrCode,
  BarChart3,
  Search,
  Lock,
  Globe,
  CheckCircle2,
  Smartphone,
  Moon,
  Edit,
  Filter,
  CalendarDays,
  UserCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Secure Authentication",
    desc: "Email-based signup with OTP verification and secure password reset. Each user is assigned a role (student, institute, or company) at registration.",
    highlights: ["OTP email verification", "Password reset flow", "Role-based access"],
  },
  {
    icon: Award,
    title: "Digital Credential Management",
    desc: "Issue, store, and manage tamper-proof digital certificates. Each credential tracks issuer, issue date, expiry, type, and verification status.",
    highlights: ["Issue & store certificates", "Track verification status", "Expiry management"],
  },
  {
    icon: Edit,
    title: "Inline Editing",
    desc: "Edit credential details like issuer name directly on the card. Changes save instantly to the database with no page reload required.",
    highlights: ["Edit issuer name inline", "Instant save to database", "Real-time UI update"],
  },
  {
    icon: QrCode,
    title: "QR Code Verification",
    desc: "Every certificate comes with a unique QR code. Scan it to instantly verify the credential's authenticity — perfect for recruiters and employers.",
    highlights: ["Auto-generated QR codes", "One-scan verification", "Shareable links"],
  },
  {
    icon: BarChart3,
    title: "Admin Analytics Dashboard",
    desc: "Institutes and companies get a dedicated dashboard with real-time charts showing user growth, certificate issuance trends, and status distribution.",
    highlights: ["User growth charts", "Issuance trends", "Status breakdown pie chart"],
  },
  {
    icon: Search,
    title: "Advanced Search & Filters",
    desc: "Find any credential quickly with a powerful search bar. Filter by issuer name, verification status, or date range to narrow results.",
    highlights: ["Full-text search", "Status filter", "Date range picker"],
  },
  {
    icon: UserCheck,
    title: "Role-Based Access Control",
    desc: "Three distinct user roles — Student, Institute, and Company — each with tailored views, permissions, and dashboard capabilities.",
    highlights: ["Student, Institute, Company roles", "Conditional navigation", "Scoped data access"],
  },
  {
    icon: Lock,
    title: "Row-Level Security",
    desc: "Every database query is protected by row-level security policies. Users can only access their own data — enforced at the database level.",
    highlights: ["Server-side enforcement", "Per-user data isolation", "Secure by default"],
  },
  {
    icon: Moon,
    title: "Dark & Light Themes",
    desc: "Switch between dark and light modes with a single click. The entire UI adapts seamlessly using a consistent design token system.",
    highlights: ["One-click toggle", "System preference detection", "Consistent theming"],
  },
  {
    icon: Smartphone,
    title: "Fully Responsive",
    desc: "Every page is designed mobile-first and works beautifully on phones, tablets, and desktops. No pinching or scrolling required.",
    highlights: ["Mobile-first design", "Adaptive layouts", "Touch-friendly controls"],
  },
  {
    icon: CalendarDays,
    title: "Date-Based Filtering",
    desc: "Filter credentials by issue date range using intuitive date pickers. Quickly find certificates issued within a specific time period.",
    highlights: ["From/To date pickers", "Calendar UI", "Combined with other filters"],
  },
  {
    icon: Globe,
    title: "Instant Verification",
    desc: "Share a verification link or QR code with anyone. They can verify your credential's authenticity without needing an account.",
    highlights: ["Public verification links", "No login required to verify", "Tamper-proof checks"],
  },
];

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Platform <span className="text-primary">Features</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Everything you need to issue, manage, and verify digital credentials — 
              built with security, usability, and scalability in mind.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                  <ul className="space-y-1.5">
                    {feature.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
