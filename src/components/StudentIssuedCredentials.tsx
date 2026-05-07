import { useEffect, useState } from "react";
import { Award, Building2, Mail, IdCard, Calendar, Download, Eye, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IssuedItem {
  id: string;
  title: string;
  credential_type: string;
  issued_date: string;
  verification_status: string;
  certificate_file_url: string | null;
  issuer_name: string;
  issuer_id: string | null;
}

interface IssuerInfo {
  institute_name: string | null;
  full_name: string | null;
  email: string | null;
  appar_id: string | null;
}

export function StudentIssuedCredentials({ userId }: { userId: string }) {
  const [items, setItems] = useState<IssuedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuers, setIssuers] = useState<Record<string, IssuerInfo>>({});
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("credentials")
        .select("id,title,credential_type,issued_date,verification_status,certificate_file_url,issuer_name,issuer_id")
        .eq("user_id", userId)
        .order("issued_date", { ascending: false });

      if (error) {
        toast.error("Could not load your certificates");
        setLoading(false);
        return;
      }

      const list = (data || []) as IssuedItem[];
      setItems(list);

      // Fetch issuer details (email + appar_id) per credential via secure RPC
      const map: Record<string, IssuerInfo> = {};
      await Promise.all(
        list.map(async (c) => {
          const { data: info } = await supabase.rpc("get_credential_issuer_info", {
            _credential_id: c.id,
          });
          if (info && info.length > 0) {
            const row = info[0];
            map[c.id] = {
              institute_name: row.institute_name,
              full_name: row.full_name,
              email: row.email,
              appar_id: row.appar_id,
            };
          }
        })
      );
      setIssuers(map);
      setLoading(false);
    };
    load();
  }, [userId]);

  const getSignedUrl = async (path: string) => {
    if (/^https?:\/\//i.test(path)) return path;
    const { data, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(path, 60);
    if (error || !data?.signedUrl) throw new Error(error?.message || "Could not generate file link");
    return data.signedUrl;
  };

  const handleView = async (c: IssuedItem) => {
    if (!c.certificate_file_url) return;
    setActionId(c.id);
    try {
      const url = await getSignedUrl(c.certificate_file_url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open certificate");
    } finally {
      setActionId(null);
    }
  };

  const handleDownload = async (c: IssuedItem) => {
    if (!c.certificate_file_url) return;
    setActionId(c.id);
    try {
      const url = await getSignedUrl(c.certificate_file_url);
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = (c.certificate_file_url.split(".").pop() || "pdf").toLowerCase();
      const safeTitle = c.title.replace(/[^a-z0-9_-]+/gi, "_").slice(0, 60) || "certificate";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${safeTitle}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not download certificate");
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
        <p className="text-muted-foreground max-w-sm mx-auto">
          When your institute issues a certificate to you, it will appear here with full issuer details and download options.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((c) => {
        const issuer = issuers[c.id];
        const instituteLabel = issuer?.institute_name || issuer?.full_name || c.issuer_name;
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
                  <p className="text-xs text-muted-foreground capitalize">
                    {c.credential_type}
                  </p>
                </div>
              </div>
              <Badge
                variant={c.verification_status === "verified" ? "default" : "secondary"}
                className="capitalize shrink-0"
              >
                {c.verification_status}
              </Badge>
            </div>

            {/* Issued by — institute info */}
            <div className="rounded-xl bg-muted/40 border border-border/60 p-3 mb-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Issued by
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{instituteLabel}</span>
                </div>
                {issuer?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a
                      href={`mailto:${issuer.email}`}
                      className="text-primary hover:underline truncate"
                    >
                      {issuer.email}
                    </a>
                  </div>
                )}
                {issuer?.appar_id && (
                  <div className="flex items-center gap-2">
                    <IdCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Appar ID:</span>
                    <span className="font-mono text-xs truncate">{issuer.appar_id}</span>
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

            {/* Actions */}
            {c.certificate_file_url ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleView(c)}
                  disabled={actionId === c.id}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(c)}
                  disabled={actionId === c.id}
                >
                  {actionId === c.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Certificate file not attached.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
