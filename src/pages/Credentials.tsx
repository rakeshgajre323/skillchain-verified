import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CertificateCard } from "@/components/CertificateCard";
import {
  Award,
  Plus,
  Search,
} from "lucide-react";

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

export default function Credentials() {
  const { user, loading } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [issuerFilter, setIssuerFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (user) fetchCredentials();
  }, [user]);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("credentials")
        .select("*")
        .order("issued_date", { ascending: false });

      if (error) { console.error("Error fetching credentials:", error); return; }

      setCredentials(
        (data || []).map((cred) => ({
          ...cred,
          verification_status: cred.verification_status as Credential["verification_status"],
        }))
      );
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialUpdate = (updated: Credential) => {
    setCredentials((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Unique issuers for filter dropdown
  const uniqueIssuers = [...new Set(credentials.map((c) => c.issuer_name))];

  const filteredCredentials = credentials.filter((cred) => {
    const matchesSearch =
      cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.issuer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cred.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cred.verification_status === statusFilter;
    const matchesIssuer = !issuerFilter || cred.issuer_name === issuerFilter;
    const issuedDate = new Date(cred.issued_date);
    const matchesDateFrom = !dateFrom || issuedDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || issuedDate <= new Date(dateTo + "T23:59:59");
    return matchesSearch && matchesStatus && matchesIssuer && matchesDateFrom && matchesDateTo;
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
              <h1 className="text-2xl md:text-3xl font-display font-bold">My Credentials</h1>
              <p className="text-muted-foreground">View and manage your verified credentials</p>
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
              <div className="text-2xl font-display font-bold text-success">{stats.verified}</div>
              <div className="text-sm text-success/80">Verified</div>
            </div>
            <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
              <div className="text-2xl font-display font-bold text-warning">{stats.pending}</div>
              <div className="text-sm text-warning/80">Pending</div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by title, issuer, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
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

            {/* Advanced Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={issuerFilter}
                onChange={(e) => setIssuerFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border-2 border-input bg-background text-sm focus:border-primary focus:outline-none transition-colors"
              >
                <option value="">All Issuers</option>
                {uniqueIssuers.map((issuer) => (
                  <option key={issuer} value={issuer}>{issuer}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">From:</span>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 w-auto" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">To:</span>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 w-auto" />
              </div>
              {(issuerFilter || dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={() => { setIssuerFilter(""); setDateFrom(""); setDateTo(""); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Credentials Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredCredentials.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {credentials.length === 0 ? "No credentials yet" : "No matching credentials"}
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
              {filteredCredentials.map((credential) => (
                <CertificateCard
                  key={credential.id}
                  credential={credential}
                  onUpdate={handleCredentialUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
