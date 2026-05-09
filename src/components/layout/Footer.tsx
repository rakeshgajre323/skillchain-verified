import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Github, Linkedin, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import indiaGovLogo from "@/assets/india-gov-in.svg";

function VisitorCounter({ value }: { value: number | null }) {
  // Pad to 7 digits like the reference odometer style
  const digits = (value ?? 0).toString().padStart(7, "0").split("");
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm font-semibold text-primary-foreground/90">
        Visitor:
      </span>
      <div className="inline-flex gap-0.5 rounded-md bg-background/95 p-1 shadow-inner">
        {digits.map((d, i) => (
          <span
            key={i}
            className="inline-flex h-6 w-4 items-center justify-center rounded-sm bg-foreground text-background font-mono text-sm font-bold tabular-nums"
            aria-hidden="true"
          >
            {d}
          </span>
        ))}
      </div>
      <span className="sr-only">{value ?? 0} visitors</span>
    </div>
  );
}

export function Footer() {
  const [visitors, setVisitors] = useState<number | null>(null);
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    let cancelled = false;
    supabase.rpc("increment_visitor_count").then(({ data, error }) => {
      if (cancelled) return;
      if (!error && data !== null) {
        setVisitors(Number(data));
      } else {
        // Fallback: just read the current count
        supabase
          .from("site_stats")
          .select("visitor_count")
          .eq("id", 1)
          .maybeSingle()
          .then(({ data: row }) => {
            if (!cancelled && row) setVisitors(Number(row.visitor_count));
          });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* soft radial accents like the reference */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary-foreground)/0.12),transparent_45%),radial-gradient(circle_at_85%_80%,hsl(var(--primary-foreground)/0.10),transparent_50%)]"
      />

      <div className="container relative py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand + socials + visitor */}
          <div className="md:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary-foreground/15">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">
                Certi<span className="text-primary-foreground/80">Vault</span>
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Secure, verifiable credentials for the modern workforce.
            </p>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
                Connect on Social Media
              </span>
              <div className="flex gap-2">
                <a
                  href="https://wa.me/+917989975435"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href="https://github.com/rakeshgajre323"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/rakesh-gajre-1bba71257/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="inline-flex items-center rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs">
              Last Updated: {lastUpdated}
            </div>

            <div className="pt-1">
              <VisitorCounter value={visitors} />
            </div>
          </div>

          {/* Product */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/docs" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">About</Link></li>
              <li><Link to="/careers" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/security" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* India.gov.in badge */}
          <div className="md:col-span-2 flex md:flex-col items-start md:items-end justify-between md:justify-start gap-3">
            <h4 className="font-semibold mb-0 md:mb-4">National Portal</h4>
            <a
              href="https://www.india.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit india.gov.in — National Portal of India"
              title="National Portal of India"
              className="inline-block rounded-md bg-background/95 p-2 shadow-md hover:shadow-lg transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              <img
                src={indiaGovLogo}
                alt="india.gov.in — National Portal of India"
                className="h-12 w-auto md:h-14 object-contain"
                loading="lazy"
                decoding="async"
              />
            </a>
          </div>
        </div>

        <div className="border-t border-primary-foreground/15 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-primary-foreground/80">
            © {new Date().getFullYear()} CertiVault Credentials. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/80">
            Built with security in mind.
          </p>
        </div>
      </div>
    </footer>
  );
}
