import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { StudentIssuedCredentials } from "@/components/StudentIssuedCredentials";

interface IssuedCredential {
  id: string;
  title: string;
  student_full_name: string;
  student_appar_id: string;
  student_roll_number: string;
  student_email: string | null;
  issued_date: string;
  verification_status: string;
  certificate_file_url: string | null;
}
import {
  Award,
  FileText,
  Plus,
  Search,
  Settings,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Fingerprint,
} from "lucide-react";

const studentStats = [
  { label: "Total Credentials", value: "12", icon: Award, trend: "+2 this month" },
  { label: "Verified", value: "10", icon: CheckCircle2, trend: "83% verified" },
  { label: "Pending", value: "2", icon: Clock, trend: "Awaiting verification" },
  { label: "Shared", value: "5", icon: Users, trend: "With 3 companies" },
];

const instituteStats = [
  { label: "Credentials Issued", value: "1,234", icon: Award, trend: "+156 this month" },
  { label: "Active Students", value: "5,678", icon: GraduationCap, trend: "+234 enrolled" },
  { label: "Programs", value: "45", icon: FileText, trend: "12 certificates" },
  { label: "Verification Rate", value: "98%", icon: TrendingUp, trend: "+2% from last month" },
];

const companyStats = [
  { label: "Verifications", value: "234", icon: CheckCircle2, trend: "+45 this month" },
  { label: "Candidates Screened", value: "567", icon: Users, trend: "89% success rate" },
  { label: "Active Jobs", value: "12", icon: Briefcase, trend: "4 pending review" },
  { label: "Time Saved", value: "120h", icon: Clock, trend: "vs manual verification" },
];

const recentActivity = [
  { action: "Credential verified", item: "AWS Certified Developer", time: "2 hours ago" },
  { action: "New credential received", item: "Bachelor of Science", time: "1 day ago" },
  { action: "Profile updated", item: "Contact information", time: "3 days ago" },
];

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [issued, setIssued] = useState<IssuedCredential[]>([]);
  const [loadingIssued, setLoadingIssued] = useState(false);

  useEffect(() => {
    const loadIssued = async () => {
      if (!user || profile?.role !== "institute") return;
      setLoadingIssued(true);
      const { data, error } = await supabase
        .from("credentials")
        .select("id,title,student_full_name,student_appar_id,student_roll_number,student_email,issued_date,verification_status,certificate_file_url")
        .eq("issuer_id", user.id)
        .order("issued_date", { ascending: false })
        .limit(25);
      if (!error && data) setIssued(data as IssuedCredential[]);
      setLoadingIssued(false);
    };
    loadIssued();
  }, [user, profile?.role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getRoleIcon = () => {
    switch (profile?.role) {
      case "student":
        return GraduationCap;
      case "institute":
        return Building2;
      case "company":
        return Briefcase;
      default:
        return Users;
    }
  };

  const getRoleStats = () => {
    switch (profile?.role) {
      case "student":
        return studentStats;
      case "institute":
        return instituteStats;
      case "company":
        return companyStats;
      default:
        return studentStats;
    }
  };

  const getRoleActions = () => {
    switch (profile?.role) {
      case "student":
        return [
          { label: "Request Credential", icon: Plus, href: "/request-credential" },
          { label: "View Credentials", icon: Award, href: "/credentials" },
          { label: "Share Credentials", icon: Users, href: "/credentials" },
        ];
      case "institute":
        return [
          { label: "Manage Requests", icon: Users, href: "/manage-requests" },
          { label: "Upload Certificate", icon: Plus, href: "/issue-credential" },
          { label: "View Analytics", icon: TrendingUp, href: "/admin" },
        ];
      case "company":
        return [
          { label: "Verify Credential", icon: Search, href: "/credentials" },
          { label: "Browse Candidates", icon: Users, href: "/dashboard" },
          { label: "Post Job", icon: Briefcase, href: "/dashboard" },
        ];
      default:
        return [];
    }
  };

  const displayName = profile?.full_name || profile?.institute_name || profile?.company_name || "User";
  const RoleIcon = getRoleIcon();
  const stats = getRoleStats();
  const actions = getRoleActions();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 shrink-0">
                <RoleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold truncate">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground capitalize">
                  {profile?.role} Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid - 12-col system, top row of 4 stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="surface-card animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="font-display font-bold mb-1" style={{ fontSize: "32px", lineHeight: 1.1 }}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.trend}</div>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-display font-semibold mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} to={action.href}>
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 flex flex-col gap-3 hover:border-primary hover:bg-primary/5 transition-all animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{action.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>

              {/* Main Content Area */}
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h2 className="text-xl font-display font-semibold">
                    {profile?.role === "student" && "Your Credentials"}
                    {profile?.role === "institute" && "Recent Issuances"}
                    {profile?.role === "company" && "Verification Queue"}
                  </h2>
                  {profile?.role === "institute" && (
                    <Link to="/issue-credential">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Upload Certificate
                      </Button>
                    </Link>
                  )}
                </div>

                {profile?.role === "institute" ? (
                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    {loadingIssued ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
                    ) : issued.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                          <Award className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">No credentials yet</h3>
                        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                          Start issuing credentials to your students. They'll appear here for easy management.
                        </p>
                        <Link to="/issue-credential">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" /> Upload Certificate
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>APPAR ID</TableHead>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Certificate</TableHead>
                            <TableHead>Issued</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">File</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {issued.map((c) => (
                            <TableRow key={c.id}>
                              <TableCell>
                                <div className="font-medium">{c.student_full_name}</div>
                                {c.student_email && (
                                  <div className="text-xs text-muted-foreground">{c.student_email}</div>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-xs">{c.student_appar_id}</TableCell>
                              <TableCell className="font-mono text-xs">{c.student_roll_number}</TableCell>
                              <TableCell>{c.title}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(c.issued_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={c.verification_status === "verified" ? "default" : "secondary"}
                                  className="capitalize"
                                >
                                  {c.verification_status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {c.certificate_file_url ? (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const path = c.certificate_file_url!;
                                      // Backwards-compat: if a full URL was stored previously, just open it
                                      if (/^https?:\/\//i.test(path)) {
                                        window.open(path, "_blank", "noopener,noreferrer");
                                        return;
                                      }
                                      const { data, error } = await supabase.storage
                                        .from("certificates")
                                        .createSignedUrl(path, 60);
                                      if (data?.signedUrl) {
                                        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
                                      }
                                    }}
                                    className="text-primary hover:underline text-sm"
                                  >
                                    View
                                  </button>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      </div>
                    )}
                  </div>
                ) : profile?.role === "student" ? (
                  <StudentIssuedCredentials userId={user.id} />
                ) : (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                      <Award className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No credentials yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                      {profile?.role === "company" &&
                        "When you verify candidate credentials, they'll be stored here for your records."}
                    </p>
                    <Link to="/credentials">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Verify Credential
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Profile
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium truncate ml-2">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium capitalize">{profile?.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="inline-flex items-center gap-1 text-success font-medium capitalize">
                      <CheckCircle2 className="h-3 w-3" />
                      {profile?.status}
                    </span>
                  </div>
                  {profile?.role === "student" && profile?.appar_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Fingerprint className="h-3.5 w-3.5" />
                        Appar ID
                      </span>
                      <span className="font-mono text-xs font-medium truncate ml-2" title={profile.appar_id}>
                        {profile.appar_id}
                      </span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{profile.phone}</span>
                    </div>
                  )}
                </div>
                {profile?.role === "student" && (
                  <Link to="/request-credential">
                    <Button variant="hero" className="w-full mt-4" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Request Certificate from Institute
                    </Button>
                  </Link>
                )}
                <Link to="/profile-settings">
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    Edit Profile
                  </Button>
                </Link>
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.item}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
