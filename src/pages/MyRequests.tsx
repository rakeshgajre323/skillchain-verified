import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  FileText,
  Send,
  CheckCircle2,
  Award,
  XCircle,
  Clock,
  Plus,
  AlertCircle,
} from "lucide-react";

type Status = "pending" | "approved" | "rejected" | "issued";

interface RequestRow {
  id: string;
  title: string;
  credential_type: string;
  description: string | null;
  status: Status;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  issuer_id: string;
}

interface IssuedMatch {
  id: string;
  issued_date: string;
  certificate_file_url: string | null;
}

const statusMeta: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending review", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  issued: { label: "Issued", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface TimelineStep {
  key: string;
  label: string;
  description?: string;
  timestamp?: string;
  state: "done" | "current" | "pending" | "rejected";
  icon: React.ComponentType<{ className?: string }>;
}

function buildTimeline(req: RequestRow, issued: IssuedMatch | undefined): TimelineStep[] {
  const submittedDone: TimelineStep = {
    key: "submitted",
    label: "Submitted",
    description: "Request sent to the institute",
    timestamp: req.created_at,
    state: "done",
    icon: Send,
  };

  if (req.status === "rejected") {
    return [
      submittedDone,
      {
        key: "rejected",
        label: "Rejected",
        description: req.rejection_reason || "The institute did not approve this request.",
        timestamp: req.updated_at,
        state: "rejected",
        icon: XCircle,
      },
    ];
  }

  const approvedTs =
    req.status === "approved" || req.status === "issued" ? req.updated_at : undefined;
  const issuedTs = issued?.issued_date ?? (req.status === "issued" ? req.updated_at : undefined);

  return [
    submittedDone,
    {
      key: "approved",
      label: "Approved",
      description: "Institute reviewed and approved the request",
      timestamp: approvedTs,
      state: approvedTs ? "done" : req.status === "pending" ? "current" : "pending",
      icon: CheckCircle2,
    },
    {
      key: "issued",
      label: "Issued",
      description: "Certificate issued and visible on your dashboard",
      timestamp: issuedTs,
      state: issuedTs ? "done" : "pending",
      icon: Award,
    },
  ];
}

export default function MyRequests() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [issuedByRequest, setIssuedByRequest] = useState<Record<string, IssuedMatch>>({});

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data: reqs, error: reqErr } = await supabase
      .from("credential_requests")
      .select(
        "id,title,credential_type,description,status,rejection_reason,created_at,updated_at,issuer_id"
      )
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (reqErr) {
      setError(reqErr.message || "Could not load your requests");
      setLoading(false);
      return;
    }

    const list = (reqs || []) as RequestRow[];
    setRequests(list);

    // Best-effort match approved/issued requests to credentials by title + issuer
    const approvedOrIssued = list.filter(
      (r) => r.status === "approved" || r.status === "issued"
    );
    if (approvedOrIssued.length > 0) {
      const { data: creds } = await supabase
        .from("credentials")
        .select("id,title,issuer_id,issued_date,certificate_file_url")
        .eq("user_id", user.id);
      const map: Record<string, IssuedMatch> = {};
      for (const r of approvedOrIssued) {
        const match = (creds || []).find(
          (c) => c.issuer_id === r.issuer_id && c.title === r.title
        );
        if (match) {
          map[r.id] = {
            id: match.id,
            issued_date: match.issued_date,
            certificate_file_url: match.certificate_file_url,
          };
        }
      }
      setIssuedByRequest(map);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">
                Certificate Requests
              </h1>
              <p className="text-sm text-muted-foreground">
                Track the status history of every certificate you've requested.
              </p>
            </div>
            <Link to="/request-credential">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Couldn't load your requests</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={load}>
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No requests yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                Submit your first certificate request to your institute and track its progress here.
              </p>
              <Link to="/request-credential">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Certificate
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const meta = statusMeta[req.status];
                const issued = issuedByRequest[req.id];
                const timeline = buildTimeline(req, issued);
                return (
                  <article
                    key={req.id}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <header className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h2 className="font-semibold truncate">{req.title}</h2>
                        <p className="text-xs text-muted-foreground capitalize">
                          {req.credential_type}
                        </p>
                      </div>
                      <Badge variant={meta.variant} className="capitalize shrink-0">
                        {meta.label}
                      </Badge>
                    </header>

                    {req.description && (
                      <p className="text-sm text-muted-foreground mb-4">{req.description}</p>
                    )}

                    {/* Timeline */}
                    <ol className="relative border-s border-border ms-2 space-y-4">
                      {timeline.map((step) => {
                        const Icon = step.icon;
                        const dotColor =
                          step.state === "done"
                            ? "bg-primary text-primary-foreground border-primary"
                            : step.state === "rejected"
                              ? "bg-destructive text-destructive-foreground border-destructive"
                              : step.state === "current"
                                ? "bg-secondary text-secondary-foreground border-secondary animate-pulse"
                                : "bg-muted text-muted-foreground border-border";
                        return (
                          <li key={step.key} className="ms-4">
                            <span
                              className={`absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border ${dotColor}`}
                            >
                              <Icon className="h-3 w-3" />
                            </span>
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <p className="font-medium text-sm">{step.label}</p>
                              {step.timestamp ? (
                                <time className="text-xs text-muted-foreground">
                                  {formatDateTime(step.timestamp)}
                                </time>
                              ) : (
                                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Awaiting
                                </span>
                              )}
                            </div>
                            {step.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {step.description}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ol>

                    {issued && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <Link to="/dashboard">
                          <Button size="sm" variant="outline">
                            <Award className="h-4 w-4 mr-2" />
                            View on Dashboard
                          </Button>
                        </Link>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
