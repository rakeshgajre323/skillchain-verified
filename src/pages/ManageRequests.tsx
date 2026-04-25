import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { ArrowLeft, Check, X, Upload, Loader2 } from "lucide-react";

interface RequestRow {
  id: string;
  student_id: string;
  title: string;
  credential_type: string;
  description: string | null;
  student_full_name: string;
  student_email: string;
  student_appar_id: string;
  student_phone: string;
  status: string;
  created_at: string;
  rejection_reason: string | null;
}

export default function ManageRequests() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("credential_requests")
      .select("*")
      .eq("issuer_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setRequests(data as RequestRow[]);
  };

  useEffect(() => { load(); }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (profile && profile.role !== "institute") return <Navigate to="/dashboard" replace />;

  const updateStatus = async (id: string, status: "approved" | "rejected", rejection_reason?: string) => {
    setBusyId(id);
    try {
      const { error } = await supabase
        .from("credential_requests")
        .update({ status, rejection_reason: rejection_reason ?? null })
        .eq("id", id);
      if (error) throw error;
      logger.event("credential_request_decision", { id, status });
      toast({ title: `Request ${status}` });
      setRejectingId(null);
      setReason("");
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed";
      logger.error("credential_request_decision_failed", { error: msg });
      toast({ title: "Action failed", description: msg, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-5xl px-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-6">Credential Requests</h1>

          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">{r.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.student_full_name} · {r.student_email}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        APPAR: {r.student_appar_id} · Phone: {r.student_phone}
                      </div>
                      {r.description && <p className="text-sm mt-2">{r.description}</p>}
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <Badge
                        variant={r.status === "approved" || r.status === "issued" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {r.status}
                      </Badge>
                      {r.status === "pending" && (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => updateStatus(r.id, "approved")} disabled={busyId === r.id}>
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRejectingId(rejectingId === r.id ? null : r.id)}>
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {r.status === "approved" && (
                        <Link to={`/issue-credential?request_id=${r.id}`}>
                          <Button size="sm"><Upload className="h-4 w-4 mr-1" /> Issue Now</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  {rejectingId === r.id && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        rows={2}
                        placeholder="Reason for rejection (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setReason(""); }}>Cancel</Button>
                        <Button size="sm" variant="destructive" disabled={busyId === r.id} onClick={() => updateStatus(r.id, "rejected", reason || undefined)}>
                          Confirm reject
                        </Button>
                      </div>
                    </div>
                  )}
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
