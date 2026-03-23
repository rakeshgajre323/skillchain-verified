import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Book, Code, Key, Upload, Search, Shield, Users, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const guides = [
  {
    icon: Key,
    title: "Getting Started",
    description: "Create your account, verify your email via OTP, and set up your profile as a student, institute, or company.",
  },
  {
    icon: Upload,
    title: "Issuing Credentials",
    description: "Institutes can issue digital credentials by filling in the certificate title, description, issuer name, and dates.",
  },
  {
    icon: Search,
    title: "Searching & Filtering",
    description: "Use the dashboard search bar and filters to find credentials by issuer name, course title, or issue date.",
  },
  {
    icon: QrCode,
    title: "QR Code Verification",
    description: "Every credential includes a unique QR code that links to a verification page, enabling instant authenticity checks.",
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "All data is encrypted and protected with row-level security. Only authorized users can view or edit their credentials.",
  },
  {
    icon: Users,
    title: "Admin Dashboard",
    description: "Admins can view user growth, certificate issuance trends, and status distribution through interactive charts.",
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Pro and Enterprise users can access the REST API to programmatically issue, query, and verify credentials.",
  },
  {
    icon: Book,
    title: "FAQs",
    description: "Find answers to common questions about account management, credential verification, and platform features.",
  },
];

const Documentation = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-primary">Documentation</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Everything you need to know to get the most out of SkillChain Credentials.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide) => (
              <Card key={guide.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <guide.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{guide.description}</p>
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

export default Documentation;
