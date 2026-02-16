import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Award,
  Users,
  TrendingUp,
  Shield,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  verified: "hsl(160, 84%, 39%)",
  pending: "hsl(38, 92%, 50%)",
  rejected: "hsl(0, 84%, 60%)",
  expired: "hsl(220, 9%, 46%)",
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const [counts, setCounts] = useState({ totalUsers: 0, totalCerts: 0, verifiedCerts: 0 });
  const [userGrowthData, setUserGrowthData] = useState<{ month: string; users: number }[]>([]);
  const [certIssuanceData, setCertIssuanceData] = useState<{ month: string; issued: number }[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    const [countsRes, growthRes, issuanceRes, statusRes] = await Promise.all([
      supabase.rpc("get_admin_counts"),
      supabase.rpc("get_user_growth"),
      supabase.rpc("get_cert_issuance"),
      supabase.rpc("get_status_distribution"),
    ]);

    if (countsRes.data && countsRes.data.length > 0) {
      const c = countsRes.data[0];
      setCounts({
        totalUsers: Number(c.total_users) || 0,
        totalCerts: Number(c.total_certs) || 0,
        verifiedCerts: Number(c.verified_certs) || 0,
      });
    }

    if (growthRes.data) {
      setUserGrowthData(growthRes.data.map((r: any) => ({ month: r.month, users: Number(r.users) })));
    }

    if (issuanceRes.data) {
      setCertIssuanceData(issuanceRes.data.map((r: any) => ({ month: r.month, issued: Number(r.issued) })));
    }

    if (statusRes.data) {
      setStatusDistribution(
        statusRes.data.map((r: any) => ({
          name: r.name,
          value: Number(r.value),
          color: STATUS_COLORS[r.name] || "hsl(220, 9%, 46%)",
        }))
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const verificationRate = counts.totalCerts > 0
    ? Math.round((counts.verifiedCerts / counts.totalCerts) * 100)
    : 0;

  const summaryStats = [
    { label: "Total Users", value: counts.totalUsers.toString(), icon: Users, color: "text-primary" },
    { label: "Certificates Issued", value: counts.totalCerts.toString(), icon: Award, color: "text-accent" },
    { label: "Verification Rate", value: `${verificationRate}%`, icon: Shield, color: "text-primary" },
    { label: "Growth", value: userGrowthData.length >= 2
        ? `+${userGrowthData[userGrowthData.length - 1]?.users - userGrowthData[userGrowthData.length - 2]?.users}`
        : "—", icon: TrendingUp, color: "text-primary" },
  ];

  const totalStatus = statusDistribution.reduce((s, d) => s + d.value, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Overview of platform activity and growth</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </div>
                  <div className="text-3xl font-display font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4">User Growth</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", color: "hsl(var(--foreground))" }} />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Certificate Issuance</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={certIssuanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="issued" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-lg mb-4">Certificate Status Distribution</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={240} className="max-w-xs">
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {statusDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4">
                {statusDistribution.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-muted-foreground capitalize">{s.name}</span>
                    <span className="text-sm font-semibold">
                      {totalStatus > 0 ? Math.round((s.value / totalStatus) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
