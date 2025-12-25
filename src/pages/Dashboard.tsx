import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
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
          { label: "View Credentials", icon: Award },
          { label: "Share Credentials", icon: Users },
          { label: "Request Verification", icon: CheckCircle2 },
        ];
      case "institute":
        return [
          { label: "Issue Credential", icon: Plus },
          { label: "Manage Students", icon: Users },
          { label: "View Analytics", icon: TrendingUp },
        ];
      case "company":
        return [
          { label: "Verify Credential", icon: Search },
          { label: "Browse Candidates", icon: Users },
          { label: "Post Job", icon: Briefcase },
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
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-primary/10">
                <RoleIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-muted-foreground capitalize">
                  {profile?.role} Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-display font-bold mb-1">
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
              <div className="grid sm:grid-cols-3 gap-4">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto py-6 flex flex-col gap-3 hover:border-primary hover:bg-primary/5 transition-all animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Main Content Area */}
              <div className="mt-8">
                <h2 className="text-xl font-display font-semibold mb-4">
                  {profile?.role === "student" && "Your Credentials"}
                  {profile?.role === "institute" && "Recent Issuances"}
                  {profile?.role === "company" && "Verification Queue"}
                </h2>
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                  <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    No credentials yet
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                    {profile?.role === "student" &&
                      "Your verified credentials will appear here. Ask your institution to issue your first credential."}
                    {profile?.role === "institute" &&
                      "Start issuing credentials to your students. They'll appear here for easy management."}
                    {profile?.role === "company" &&
                      "When you verify candidate credentials, they'll be stored here for your records."}
                  </p>
                  <Button variant="default">
                    <Plus className="h-4 w-4 mr-2" />
                    {profile?.role === "student" && "Request Credential"}
                    {profile?.role === "institute" && "Issue Credential"}
                    {profile?.role === "company" && "Verify Credential"}
                  </Button>
                </div>
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
                  {profile?.phone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{profile.phone}</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Edit Profile
                </Button>
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
