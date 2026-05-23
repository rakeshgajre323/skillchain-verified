import { AlertTriangle } from "lucide-react";

const DISCLAIMER_TEXT =
  "⚠️ Disclaimer: This website is a demonstration/project prototype created for educational and portfolio purposes only. All institution names, logos, statistics, credentials, and information displayed are fictional or used as placeholders. This project is not affiliated with, endorsed by, or connected to any real university, company, organization, or entity unless explicitly stated.";

export function DisclaimerMarquee() {
  const items = Array(6).fill(DISCLAIMER_TEXT);

  return (
    <div className="w-full bg-warning/10 border-y border-warning/25 overflow-hidden py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((text, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-8 text-sm text-warning-foreground/90 font-medium"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
