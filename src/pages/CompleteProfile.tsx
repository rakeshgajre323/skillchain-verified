import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Loader2, GraduationCap, Building2, Briefcase } from "lucide-react";

type UserRole = "student" | "institute" | "company";

const roles = [
  { value: "student" as UserRole, label: "Student", icon: GraduationCap, desc: "Manage your credentials" },
  { value: "institute" as UserRole, label: "Institute", icon: Building2, desc: "Issue & verify credentials" },
  { value: "company" as UserRole, label: "Company", icon: Briefcase, desc: "Verify candidate credentials" },
];

export default function CompleteProfile() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("profiles").insert([{
        user_id: user.id,
        role: selectedRole,
        full_name: fullName.trim(),
        status: "pending",
      }]);

      if (error) {
        console.error("Profile creation error:", error);
        toast.error("Failed to create profile. Please try again.");
        return;
      }

      await refreshProfile();
      toast.success("Profile created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">Select your role to get started</p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Select Your Role</Label>
                <div className="grid gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        selectedRole === role.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <role.icon className={`h-6 w-6 ${selectedRole === role.value ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium">{role.label}</p>
                        <p className="text-sm text-muted-foreground">{role.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Profile...</>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
