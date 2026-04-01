import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { RoleTabs, UserRole } from "@/components/auth/RoleTabs";
import { StudentSignupForm } from "@/components/auth/StudentSignupForm";
import { InstituteSignupForm } from "@/components/auth/InstituteSignupForm";
import { CompanySignupForm } from "@/components/auth/CompanySignupForm";
import { useAuth } from "@/hooks/useAuth";
import { Shield, CheckCircle2 } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Signup() {
  const [activeRole, setActiveRole] = useState<UserRole>("student");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full mb-4"
              onClick={async () => {
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (result.error) {
                  toast.error("Google sign-up failed. Please try again.");
                  return;
                }
                if (result.redirected) return;
                navigate("/dashboard");
              }}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or sign up with email</span>
              <Separator className="flex-1" />
            </div>

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
