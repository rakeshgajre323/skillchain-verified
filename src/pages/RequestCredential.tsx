import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

interface Issuer {
  user_id: string;
  institute_name: string | null;
  full_name: string | null;
}

interface RequestRow {
  id: string;
  title: string;
  issuer_id: string;
  status: string;
  created_at: string;
  rejection_reason: string | null;
}

export default function RequestCredential() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    issuer_id: "",
    title: "",
    credential_type: "certificate",
    description: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data: issuersData } = await supabase
        .from("profiles")
        .select("user_id, institute_name, full_name")
        .eq("role", "institute");
      if (issuersData) setIssuers(issuersData as Issuer[]);

      if (user) {
        const { data: reqs } = await supabase
          .from("credential_requests")
          .select("id,title,issuer_id,status,created_at,rejection_reason")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });
        if (reqs) setRequests(reqs as RequestRow[]);
      }
    };
    if (user) load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (profile && profile.role !== "student") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.issuer_id || !form.title.trim()) {
      toast({ title: "Please select an issuer and title", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("credential_requests").insert([
        {
          student_id: user.id,
          issuer_id: form.issuer_id,
          title: form.title.trim(),
          credential_type: form.credential_type,
          description: form.description || null,
          student_full_name: profile?.full_name || "",
          student_email: user.email || "",
          student_appar_id: profile?.appar_id || "",
          student_roll_number: "",
          student_phone: profile?.phone || "",
        },
      ]);
      if (error) throw error;
      logger.event("credential_request_created", { issuer_id: form.issuer_id });
      toast({ title: "Request sent", description: "The issuer has been notified." });
      setForm({ issuer_id: "", title: "", credential_type: "certificate", description: "" });

      const { data: reqs } = await supabase
        .from("credential_requests")
        .select("id,title,issuer_id,status,created_at,rejection_reason")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      if (reqs) setRequests(reqs as RequestRow[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send request";
      logger.error("credential_request_failed", { error: msg });
      toast({ title: "Could not send request", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-3xl px-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-6">Request a Credential</h1>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-4 md:p-6 space-y-4 mb-8">
            <div>
              <Label htmlFor="issuer">Issuing Institute *</Label>
              <Select value={form.issuer_id} onValueChange={(v) => setForm((p) => ({ ...p, issuer_id: v }))}>
                <SelectTrigger id="issuer"><SelectValue placeholder="Select an institute" /></SelectTrigger>
                <SelectContent>
                  {issuers.map((i) => (
                    <SelectItem key={i.user_id} value={i.user_id}>
                      {i.institute_name || i.full_name || "Unnamed institute"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Credential Title *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Bachelor of Science" />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input id="type" value={form.credential_type} onChange={(e) => setForm((p) => ({ ...p, credential_type: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="description">Notes</Label>
              <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional context for the issuer" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</> : <><Send className="h-4 w-4 mr-2" /> Send Request</>}
              </Button>
            </div>
          </form>

          <h2 className="text-xl font-display font-semibold mb-3">Your Requests</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                    {r.rejection_reason && (
                      <div className="text-xs text-destructive mt-1">Reason: {r.rejection_reason}</div>
                    )}
                  </div>
                  <Badge variant={r.status === "approved" || r.status === "issued" ? "default" : r.status === "rejected" ? "destructive" : "secondary"} className="capitalize w-fit">
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
