import React, { useState } from "react";
import { Award, Building2, Calendar, ChevronDown, QrCode, FileText, User, Phone, Hash, IdCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface Credential {
  id: string;
  title: string;
  description: string | null;
  issuer_name: string;
  credential_type: string;
  issued_date: string;
  expiry_date: string | null;
  verification_status: "pending" | "verified" | "rejected" | "expired";
  student_full_name?: string | null;
  student_appar_id?: string | null;
  student_phone?: string | null;
  student_roll_number?: string | null;
  student_email?: string | null;
  certificate_file_url?: string | null;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: () => <span className="h-3 w-3 rounded-full bg-warning inline-block" />,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  verified: {
    label: "Verified",
    icon: () => <span className="h-3 w-3 rounded-full bg-success inline-block" />,
    className: "bg-success/10 text-success border-success/20",
  },
  rejected: {
    label: "Rejected",
    icon: () => <span className="h-3 w-3 rounded-full bg-destructive inline-block" />,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  expired: {
    label: "Expired",
    icon: () => <span className="h-3 w-3 rounded-full bg-muted-foreground inline-block" />,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
};

interface CertificateCardProps {
  credential: Credential;
  onUpdate?: (updated: Credential) => void;
}

export function CertificateCard({ credential }: CertificateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const status = statusConfig[credential.verification_status];
  const StatusIcon = status.icon;

  const verificationUrl = `${window.location.origin}/credentials?verify=${credential.id}`;

  return (
    <div
      className={cn(
        "group p-6 rounded-2xl bg-card border border-border",
        "hover:scale-[1.02] hover:shadow-xl hover:border-primary/50",
        "transition-all duration-300 ease-out"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Award className="h-5 w-5 text-primary" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
            status.className
          )}
        >
          <StatusIcon />
          {status.label}
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
        {credential.title}
      </h3>

      {credential.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {credential.description}
        </p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate flex-1 min-w-0">{credential.issuer_name}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Issued {new Date(credential.issued_date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Symmetric student-details block: identical for student & company views */}
      {(credential.student_full_name || credential.student_appar_id) && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
            Recipient Details
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {credential.student_full_name && (
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium truncate">{credential.student_full_name}</span>
              </div>
            )}
            {credential.student_appar_id && (
              <div className="flex items-center gap-2">
                <IdCard className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">APPAR ID:</span>
                <span className="font-mono text-xs truncate">{credential.student_appar_id}</span>
              </div>
            )}
            {credential.student_roll_number && (
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Roll No:</span>
                <span className="font-mono text-xs truncate">{credential.student_roll_number}</span>
              </div>
            )}
            {credential.student_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium truncate">{credential.student_phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expandable Details */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "mt-4 opacity-100" : "opacity-0"
        )}>
          <CollapsibleContent className="space-y-3 pt-4 border-t border-border">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{credential.credential_type}</span>
              </div>
              {credential.expiry_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="font-medium">{new Date(credential.expiry_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs">{credential.id.slice(0, 8)}...</span>
              </div>
            </div>

            {credential.certificate_file_url && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={async () => {
                  const path = credential.certificate_file_url!;
                  if (/^https?:\/\//i.test(path)) {
                    window.open(path, "_blank", "noopener,noreferrer");
                    return;
                  }
                  const { supabase } = await import("@/integrations/supabase/client");
                  const { data } = await supabase.storage
                    .from("certificates")
                    .createSignedUrl(path, 60);
                  if (data?.signedUrl) {
                    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Certificate File
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            )}

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowQR(!showQR)}>
                <QrCode className="h-4 w-4 mr-2" />
                {showQR ? "Hide" : "Show"} Verification QR
              </Button>
              {showQR && (
                <div className="p-4 bg-background rounded-xl border border-border animate-fade-in-up">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={140}
                    bgColor="transparent"
                    fgColor="currentColor"
                    className="text-foreground"
                    level="M"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Scan to verify
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full group/btn">
              {isExpanded ? "Hide Details" : "View Details"}
              <ChevronDown className={cn(
                "h-3 w-3 ml-2 transition-transform duration-300",
                isExpanded && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
        </div>
      </Collapsible>
    </div>
  );
}
