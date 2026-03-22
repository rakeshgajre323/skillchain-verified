import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, Phone, MapPin, MessageCircle, Github, Linkedin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Get In <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions about SkillChain? We'd love to hear from you. Reach out through any of the channels below.
            </p>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="pb-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
            {/* WhatsApp */}
            <a
              href="https://wa.me/+917989975435"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300 group"
            >
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-green-500/10 mb-4 group-hover:bg-green-500/20 transition-colors">
                <MessageCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">WhatsApp</h3>
              <p className="text-muted-foreground text-sm mb-3">Chat with us directly</p>
              <p className="text-primary font-medium">+91 7989975435</p>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/rakeshgajre323"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300 group"
            >
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-foreground/10 mb-4 group-hover:bg-foreground/20 transition-colors">
                <Github className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">GitHub</h3>
              <p className="text-muted-foreground text-sm mb-3">Check out our projects</p>
              <p className="text-primary font-medium">rakeshgajre323</p>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/rakesh-gajre-1bba71257/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300 group"
            >
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-blue-600/10 mb-4 group-hover:bg-blue-600/20 transition-colors">
                <Linkedin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">LinkedIn</h3>
              <p className="text-muted-foreground text-sm mb-3">Connect professionally</p>
              <p className="text-primary font-medium">Rakesh Gajre</p>
            </a>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-display font-bold mb-6 text-center">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
