import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Briefcase, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const openings = [
  {
    title: "Full-Stack Developer",
    location: "Remote / India",
    type: "Full-time",
    description: "Build and maintain the SkillChain platform using React, TypeScript, and Supabase.",
  },
  {
    title: "UI/UX Designer",
    location: "Remote",
    type: "Full-time",
    description: "Design intuitive interfaces for credential management and verification workflows.",
  },
  {
    title: "Blockchain Engineer",
    location: "Remote / India",
    type: "Contract",
    description: "Integrate blockchain-based verification for tamper-proof credential storage.",
  },
  {
    title: "DevOps Engineer",
    location: "Remote",
    type: "Full-time",
    description: "Manage cloud infrastructure, CI/CD pipelines, and platform scalability.",
  },
];

const Careers = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Join <span className="text-primary">Our Team</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Help us build the future of digital credential verification. We're looking for passionate people who want to make a difference.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Open Positions</h2>
            {openings.map((job) => (
              <Card key={job.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      {job.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {job.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                  <Button variant="outline" size="sm" className="shrink-0">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}

            <div className="text-center pt-8">
              <p className="text-muted-foreground">
                Don't see a role that fits?{" "}
                <a href="mailto:rakeshgajre2005@gmail.com" className="text-primary hover:underline">
                  Send us your resume
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
