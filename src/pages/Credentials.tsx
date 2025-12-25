import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/20",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  expired: {
    label: "Expired",
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
};

export default function Credentials() {
  const { user, loading } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [user]);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("credentials")
        .select("*")
        .order("issued_date", { ascending: false });

      if (error) {
        console.error("Error fetching credentials:", error);
        return;
      }

      // Cast the data to match our interface
      const typedData = (data || []).map((cred) => ({
        ...cred,
        verification_status: cred.verification_status as "pending" | "verified" | "rejected" | "expired",
      }));

      setCredentials(typedData);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const filteredCredentials = credentials.filter((cred) => {
    const matchesSearch =
      cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.issuer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cred.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: credentials.length,
    verified: credentials.filter((c) => c.verification_status === "verified").length,
    pending: credentials.filter((c) => c.verification_status === "pending").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                My Credentials
              </h1>
              <p className="text-muted-foreground">
                View and manage your verified credentials
              </p>
            </div>
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Request Credential
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-display font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="p-4 rounded-xl bg-success/5 border border-success/20">
              <div className="text-2xl font-display font-bold text-success">
                {stats.verified}
              </div>
              <div className="text-sm text-success/80">Verified</div>
            </div>
            <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
              <div className="text-2xl font-display font-bold text-warning">
                {stats.pending}
              </div>
              <div className="text-sm text-warning/80">Pending</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search credentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {["all", "verified", "pending", "rejected"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === "all" ? "All" : status}
                </Button>
              ))}
            </div>
          </div>

          {/* Credentials Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-2xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : filteredCredentials.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {credentials.length === 0
                  ? "No credentials yet"
                  : "No matching credentials"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {credentials.length === 0
                  ? "Your verified credentials will appear here. Request credentials from your institution to get started."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {credentials.length === 0 && (
                <Button variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Your First Credential
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCredentials.map((credential) => {
                const status = statusConfig[credential.verification_status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={credential.id}
                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
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
                        <StatusIcon className="h-3 w-3" />
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
                        <Building2 className="h-4 w-4" />
                        <span className="truncate">{credential.issuer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Issued{" "}
                          {new Date(credential.issued_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <Button variant="ghost" size="sm" className="w-full group/btn">
                        View Details
                        <ExternalLink className="h-3 w-3 ml-2 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      </Button>
                    </div>
                  </div>
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
