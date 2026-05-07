import { useEffect, useMemo, useState } from "react";
import { Award, Building2, Mail, IdCard, Calendar, Download, Eye, Loader2, ExternalLink, AlertCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Row {
  id: string;
  title: string;
  description: string | null;
  credential_type: string;
  issued_date: string;
  expiry_date: string | null;
  verification_status: string;
  certificate_file_url: string | null;
  issuer_name: string;
  issuer_id: string | null;
  issuer_institute_name: string | null;
  issuer_full_name: string | null;
  issuer_email: string | null;
  issuer_appar_id: string | null;
}

type StatusFilter = "all" | "verified" | "pending" | "rejected" | "expired";

const statusDescriptions: Record<string, string> = {
  verified: "Confirmed authentic by the issuing institute.",
  pending: "Awaiting verification by the institute.",
  rejected: "The institute did not approve this certificate.",
  expired: "This certificate is past its expiry date.",
};

export function StudentIssuedCredentials({ userId }: { userId: string }) {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_my_credentials_with_issuer");
      if (error) {
        toast.error("Could not load your certificates");
        setLoading(false);
        return;
      }
      setItems((data || []) as Row[]);
      setLoading(false);
    };
    load();
  }, [userId]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length, verified: 0, pending: 0, rejected: 0, expired: 0 };
    for (const i of items) {
      if (c[i.verification_status] !== undefined) c[i.verification_status] += 1;
    }
    return c;
  }, [items]);

  const filtered = useMemo(
    () => (statusFilter === "all" ? items : items.filter((i) => i.verification_status === statusFilter)),
    [items, statusFilter]
  );

  const getSignedUrl = async (path: string) => {
    if (/^https?:\/\//i.test(path)) return path;
    const { data, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(path, 60);
    if (error || !data?.signedUrl) {
      throw new Error(error?.message || "File could not be located in storage");
    }
    return data.signedUrl;
  };

  const handleView = async (c: Row) => {
    if (!c.certificate_file_url) {
      setFileErrors((p) => ({ ...p, [c.id]: "No file is attached to this certificate." }));
      return;
    }
    setActionId(c.id);
    try {
      const url = await getSignedUrl(c.certificate_file_url);
      setFileErrors((p) => {
        const { [c.id]: _, ...rest } = p;
        return rest;
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not open certificate";
      setFileErrors((p) => ({ ...p, [c.id]: msg }));
      toast.error(msg);
    } finally {
      setActionId(null);
    }
  };

  const handleDownload = async (c: Row) => {
    if (!c.certificate_file_url) {
      setFileErrors((p) => ({ ...p, [c.id]: "No file is attached to this certificate." }));
      return;
    }
    setActionId(c.id);
    try {
      const path = c.certificate_file_url;
      let blob: Blob;

      if (/^https?:\/\//i.test(path)) {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Download failed (HTTP ${res.status})`);
        blob = await res.blob();
      } else {
        // Use Supabase storage SDK directly — avoids CORS issues with signed URLs
        const { data, error } = await supabase.storage.from("certificates").download(path);
        if (error || !data) throw new Error(error?.message || "File not found in storage");
        blob = data;
      }

      const ext = (path.split(".").pop() || "pdf").toLowerCase().split("?")[0];
      const safeTitle = c.title.replace(/[^a-z0-9_-]+/gi, "_").slice(0, 60) || "certificate";
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${safeTitle}.${ext}`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);

      setFileErrors((p) => {
        const { [c.id]: _, ...rest } = p;
        return rest;
      });
      toast.success("Certificate downloaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not download certificate";
      setFileErrors((p) => ({ ...p, [c.id]: msg }));
      toast.error(msg);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
          <Award className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No certificates yet</h3>
        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
          Your verified credentials will appear here. Request one from your institution to get started.
        </p>
        <Link to="/request-credential">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Credential
          </Button>
        </Link>
      </div>
    );
  }

  const filterOptions: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "verified", label: "Verified" },
    { key: "pending", label: "Pending" },
    { key: "rejected", label: "Rejected" },
    { key: "expired", label: "Expired" },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((opt) => (
          <Button
            key={opt.key}
            variant={statusFilter === opt.key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(opt.key)}
          >
            {opt.label}
            <span className="ml-2 text-xs opacity-70">{counts[opt.key] ?? 0}</span>
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No certificates match this filter.
        </div>
      ) : (
        filtered.map((c) => {
          const instituteLabel = c.issuer_institute_name || c.issuer_full_name || c.issuer_name;
          const fileError = fileErrors[c.id];
          return (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{c.title}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{c.credential_type}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    variant={c.verification_status === "verified" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {c.verification_status}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground text-right max-w-[160px]">
                    {statusDescriptions[c.verification_status] || ""}
                  </span>
                </div>
              </div>

              {/* Issued by */}
              <div className="rounded-xl bg-muted/40 border border-border/60 p-3 mb-3">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                  Issued by
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{instituteLabel}</span>
                  </div>
                  {c.issuer_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <a href={`mailto:${c.issuer_email}`} className="text-primary hover:underline truncate">
                        {c.issuer_email}
                      </a>
                    </div>
                  )}
                  {c.issuer_appar_id && (
                    <div className="flex items-center gap-2">
                      <IdCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Appar ID:</span>
                      <span className="font-mono text-xs truncate">{c.issuer_appar_id}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {new Date(c.issued_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* File error state */}
              {fileError && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Certificate file unavailable</p>
                    <p className="opacity-90">{fileError}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {c.certificate_file_url ? (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleView(c)} disabled={actionId === c.id}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                  <Button size="sm" onClick={() => handleDownload(c)} disabled={actionId === c.id}>
                    {actionId === c.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>No certificate file attached. Please contact the institute.</span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
