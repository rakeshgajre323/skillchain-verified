import React, { useState } from "react";
import { Award, Building2, Calendar, ExternalLink, ChevronDown, Pencil, Check, X, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Credential {
  id: string;
  title: string;
  description: string | null;
  issuer_name: string;
  credential_type: string;
  issued_date: string;
  expiry_date: string | null;
  verification_status: "pending" | "verified" | "rejected" | "expired";
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

export function CertificateCard({ credential, onUpdate }: CertificateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIssuer, setEditIssuer] = useState(credential.issuer_name);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const status = statusConfig[credential.verification_status];
  const StatusIcon = status.icon;

  const verificationUrl = `${window.location.origin}/credentials?verify=${credential.id}`;

  const handleSaveIssuer = async () => {
    if (!editIssuer.trim() || editIssuer === credential.issuer_name) {
      setIsEditing(false);
      setEditIssuer(credential.issuer_name);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("credentials")
      .update({ issuer_name: editIssuer.trim() })
      .eq("id", credential.id);

    if (!error) {
      onUpdate?.({ ...credential, issuer_name: editIssuer.trim() });
    }
    setSaving(false);
    setIsEditing(false);
  };

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
        {/* Editable Issuer */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editIssuer}
                onChange={(e) => setEditIssuer(e.target.value)}
                className="h-7 text-sm"
                disabled={saving}
                onKeyDown={(e) => e.key === "Enter" && handleSaveIssuer()}
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveIssuer} disabled={saving}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setIsEditing(false); setEditIssuer(credential.issuer_name); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <span className="truncate">{credential.issuer_name}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Issued {new Date(credential.issued_date).toLocaleDateString()}</span>
        </div>
      </div>

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
