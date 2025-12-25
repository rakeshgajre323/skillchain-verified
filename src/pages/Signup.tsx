import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { RoleTabs, UserRole } from "@/components/auth/RoleTabs";
import { StudentSignupForm } from "@/components/auth/StudentSignupForm";
import { InstituteSignupForm } from "@/components/auth/InstituteSignupForm";
import { CompanySignupForm } from "@/components/auth/CompanySignupForm";
import { useAuth } from "@/hooks/useAuth";
import { Shield, CheckCircle2 } from "lucide-react";

export default function Signup() {
  const [activeRole, setActiveRole] = useState<UserRole>("student");
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              Choose your role and get started with SkillChain
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <RoleTabs activeRole={activeRole} onRoleChange={setActiveRole} />

            {activeRole === "student" && <StudentSignupForm />}
            {activeRole === "institute" && <InstituteSignupForm />}
            {activeRole === "company" && <CompanySignupForm />}

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Free to start
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Secure & encrypted
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              No credit card
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
