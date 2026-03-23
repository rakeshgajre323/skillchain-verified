import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Eye, Server, Key, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encryption",
    description: "All data is encrypted at rest and in transit using industry-standard AES-256 and TLS 1.3 protocols.",
  },
  {
    icon: Shield,
    title: "Row-Level Security",
    description: "Database-level policies ensure users can only access their own data. No credential data leaks across accounts.",
  },
  {
    icon: Key,
    title: "Secure Authentication",
    description: "Email OTP verification, bcrypt-hashed passwords, and secure session tokens protect every account.",
  },
  {
    icon: Eye,
    title: "QR Code Verification",
    description: "Every credential includes a cryptographically linked QR code for instant, tamper-proof verification.",
  },
  {
    icon: Server,
    title: "Infrastructure",
    description: "Hosted on enterprise-grade cloud infrastructure with automatic backups, monitoring, and 99.9% uptime SLA.",
  },
  {
    icon: AlertTriangle,
    title: "Vulnerability Reporting",
    description: "Found a security issue? Contact us at rakeshgajre2005@gmail.com. We take all reports seriously and respond within 48 hours.",
  },
];

const Security = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-primary">Security</span> at SkillChain
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your data security is our top priority. Here's how we keep your credentials safe.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((item) => (
              <Card key={item.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
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

export default Security;
