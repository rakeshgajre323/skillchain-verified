import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Globe, IdCard, Calendar, Eye, Download, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

type Detail = {
  user_id: string; full_name: string | null; email: string; phone: string | null;
  appar_id: string | null; institute_name: string | null; company_name: string | null;
  website: string | null; address: string | null; role: string; status: string;
  avatar_url: string | null; created_at: string; last_sign_in_at: string | null;
};

type Cred = {
  id: string; title: string; description: string | null; credential_type: string;
  issuer_name: string; issued_date: string; expiry_date: string | null;
  verification_status: string; certificate_file_url: string | null;
};

export default function AdminUserView() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [creds, setCreds] = useState<Cred[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);

  const previewable = creds.filter((c) => !!c.certificate_file_url);
  const currentCred = previewIndex >= 0 ? previewable[previewIndex] : null;

  const extractPath = (url: string): string | null => {
    const m = url.match(/\/certificates\/(.+?)(\?|$)/);
    if (m) return decodeURIComponent(m[1]);
    if (!url.startsWith("http")) return url.replace(/^certificates\//, "");
    return null;
  };

  const getSignedUrl = async (fileUrl: string): Promise<string | null> => {
    const path = extractPath(fileUrl);
    if (!path) return fileUrl;
    const { data, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(path, 300);
    if (error || !data) {
      toast.error("Could not access file");
      return null;
    }
    return data.signedUrl;
  };

  const openAt = async (idx: number) => {
    const c = previewable[idx];
    if (!c?.certificate_file_url) return;
    const url = await getSignedUrl(c.certificate_file_url);
    if (url) {
      setPreviewUrl(url);
      setPreviewIndex(idx);
    }
  };

  const handlePreview = (c: Cred) => {
    const idx = previewable.findIndex((p) => p.id === c.id);
    if (idx >= 0) openAt(idx);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewIndex(-1);
  };

  const goPrev = () => { if (previewIndex > 0) openAt(previewIndex - 1); };
  const goNext = () => { if (previewIndex < previewable.length - 1) openAt(previewIndex + 1); };

  useEffect(() => {
    if (!previewUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleDownload = async (c: Cred) => {
    if (!c.certificate_file_url) return;
    const url = await getSignedUrl(c.certificate_file_url);
    if (url) window.open(url, "_blank");
  };

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const [d, c] = await Promise.all([
        supabase.rpc("admin_get_user_detail", { _user_id: userId }),
        supabase.rpc("admin_get_user_credentials", { _user_id: userId }),
      ]);
      setDetail((d.data as Detail[])?.[0] || null);
      setCreds((c.data as Cred[]) || []);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">User not found</p>
        <Button onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      </div>
    );
  }

  const isStudent = detail.role === "student";
  const displayName = detail.full_name || detail.institute_name || detail.company_name || "Unnamed";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Admin
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-2xl">{displayName}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize mt-1">{detail.role} dashboard view</p>
              </div>
              <Badge variant={detail.status === "active" ? "default" : "destructive"}>{detail.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info icon={Mail} label="Email" value={detail.email} />
            <Info icon={Phone} label="Phone" value={detail.phone} />
            {isStudent && <Info icon={IdCard} label="APAAR ID" value={detail.appar_id} />}
            {!isStudent && <Info icon={Globe} label="Website" value={detail.website} />}
            {detail.institute_name && <Info icon={IdCard} label="Institute" value={detail.institute_name} />}
            {detail.company_name && <Info icon={IdCard} label="Company" value={detail.company_name} />}
            <Info icon={MapPin} label="Address" value={detail.address} />
            <Info icon={Calendar} label="Joined" value={new Date(detail.created_at).toLocaleString()} />
            <Info icon={Calendar} label="Last sign-in" value={detail.last_sign_in_at ? new Date(detail.last_sign_in_at).toLocaleString() : "Never"} />
          </CardContent>
        </Card>

        {isStudent && (
          <Card>
            <CardHeader><CardTitle>Credentials ({creds.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creds.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>{c.credential_type}</TableCell>
                      <TableCell className="text-xs">{c.issuer_name}</TableCell>
                      <TableCell><Badge>{c.verification_status}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(c.issued_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {c.certificate_file_url ? (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handlePreview(c)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDownload(c)}>
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {creds.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No credentials issued yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && closePreview()}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-4 gap-3">
          <DialogHeader className="flex-row items-center justify-between space-y-0 gap-2">
            <DialogTitle className="truncate text-base">
              {currentCred?.title || "Certificate"}
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                {previewable.length > 0 && `${previewIndex + 1} / ${previewable.length}`}
              </span>
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={goPrev} disabled={previewIndex <= 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={goNext} disabled={previewIndex >= previewable.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              {currentCred && (
                <Button size="sm" variant="outline" onClick={() => handleDownload(currentCred)}>
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={closePreview} aria-label="Close">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          {previewUrl && (
            <iframe key={previewUrl} src={previewUrl} className="w-full flex-1 rounded border" title={currentCred?.title || "Certificate"} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-foreground break-all">{value || "—"}</div>
      </div>
    </div>
  );
}
