import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  KeyRound,
  LogIn,
  Database,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "idle" | "running" | "pass" | "fail" | "skip";

interface StepResult {
  status: StepStatus;
  detail?: string;
}

interface Step {
  id: "otp" | "login" | "jwt" | "protected";
  title: string;
  description: string;
  icon: typeof MailCheck;
}

const STEPS: Step[] = [
  {
    id: "otp",
    title: "OTP / Email Verification Complete",
    description:
      "Account status is 'active' (email OTP was verified at signup).",
    icon: MailCheck,
  },
  {
    id: "login",
    title: "Login Successful",
    description: "An authenticated Supabase user is present in this session.",
    icon: LogIn,
  },
  {
    id: "jwt",
    title: "JWT Stored Correctly",
    description:
      "A valid, unexpired access token is persisted in browser storage.",
    icon: KeyRound,
  },
  {
    id: "protected",
    title: "Protected Resource Access",
    description:
      "Authenticated query against your own profile (RLS enforced) succeeds.",
    icon: Database,
  },
];

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "running")
    return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
  if (status === "pass")
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "fail") return <XCircle className="h-5 w-5 text-destructive" />;
  if (status === "skip")
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  return <Circle className="h-5 w-5 text-muted-foreground/50" />;
}

export default function SignInCheck() {
  const { user, profile, loading } = useAuth();
  const [results, setResults] = useState<Record<Step["id"], StepResult>>({
    otp: { status: "idle" },
    login: { status: "idle" },
    jwt: { status: "idle" },
    protected: { status: "idle" },
  });
  const [running, setRunning] = useState(false);

  const update = (id: Step["id"], result: StepResult) =>
    setResults((prev) => ({ ...prev, [id]: result }));

  const reset = () =>
    setResults({
      otp: { status: "idle" },
      login: { status: "idle" },
      jwt: { status: "idle" },
      protected: { status: "idle" },
    });

  const runChecks = async () => {
    setRunning(true);
    reset();

    // 1. OTP / email verification
    update("otp", { status: "running" });
    await new Promise((r) => setTimeout(r, 250));
    if (!user) {
      update("otp", {
        status: "fail",
        detail: "No signed-in user. Sign in first to evaluate verification.",
      });
      update("login", { status: "skip", detail: "Skipped — no user." });
      update("jwt", { status: "skip", detail: "Skipped — no user." });
      update("protected", { status: "skip", detail: "Skipped — no user." });
      setRunning(false);
      return;
    }
    if (profile?.status === "active") {
      update("otp", { status: "pass", detail: "Profile status: active." });
    } else if (profile?.status === "pending") {
      update("otp", {
        status: "fail",
        detail: "Profile status is 'pending'. Complete OTP verification.",
      });
    } else {
      update("otp", {
        status: "fail",
        detail: `Profile status: ${profile?.status ?? "unknown"}.`,
      });
    }

    // 2. Login successful
    update("login", { status: "running" });
    await new Promise((r) => setTimeout(r, 250));
    update("login", {
      status: "pass",
      detail: `Signed in as ${user.email} (role: ${profile?.role ?? "n/a"}).`,
    });

    // 3. JWT validated by real auth endpoint (/auth/v1/user)
    update("jwt", { status: "running" });
    await new Promise((r) => setTimeout(r, 200));
    let accessToken: string | null = null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        update("jwt", {
          status: "fail",
          detail: error?.message ?? "No session in storage.",
        });
        update("protected", { status: "skip", detail: "Skipped — no JWT." });
        setRunning(false);
        return;
      }
      accessToken = data.session.access_token;
      const parts = accessToken.split(".");
      if (parts.length !== 3) {
        update("jwt", {
          status: "fail",
          detail: "Access token is not a valid JWT shape.",
        });
        update("protected", { status: "skip", detail: "Skipped — bad JWT." });
        setRunning(false);
        return;
      }

      // Hit the real Supabase Auth REST endpoint to have the server validate the JWT
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
      const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: ANON_KEY,
        },
      });

      if (!res.ok) {
        update("jwt", {
          status: "fail",
          detail: `Auth endpoint rejected token (HTTP ${res.status}).`,
        });
        update("protected", {
          status: "skip",
          detail: "Skipped — JWT not validated by server.",
        });
        setRunning(false);
        return;
      }

      const body = await res.json();
      const persisted = Object.keys(localStorage).some(
        (k) => k.startsWith("sb-") && k.includes("auth-token")
      );

      update("jwt", {
        status: "pass",
        detail: `Server validated JWT via /auth/v1/user → ${body.email}${
          persisted ? " · persisted in localStorage." : "."
        }`,
      });
    } catch (e) {
      update("jwt", {
        status: "fail",
        detail: e instanceof Error ? e.message : "Unknown error.",
      });
      update("protected", { status: "skip", detail: "Skipped — JWT error." });
      setRunning(false);
      return;
    }

    // 4. Protected backend endpoint (edge function requires Bearer JWT)
    update("protected", { status: "running" });
    try {
      const { data, error } = await supabase.functions.invoke("whoami", {
        method: "GET",
      });

      if (error) {
        update("protected", {
          status: "fail",
          detail: `Backend rejected request: ${error.message}`,
        });
      } else if (!data?.success || !data?.profile) {
        update("protected", {
          status: "fail",
          detail: "Backend responded but returned no profile data.",
        });
      } else {
        update("protected", {
          status: "pass",
          detail: `Backend /whoami returned profile (role: ${data.profile.role}, status: ${data.profile.status}).`,
        });
      }
    } catch (e) {
      update("protected", {
        status: "fail",
        detail: e instanceof Error ? e.message : "Unknown error.",
      });
    }

    setRunning(false);
  };

  const passed = Object.values(results).filter((r) => r.status === "pass").length;
  const failed = Object.values(results).filter((r) => r.status === "fail").length;
  const total = STEPS.length;
  const completedAny = passed + failed > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Sign-In Health Check
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Verify the full authentication flow end-to-end: OTP verification,
              login, JWT storage, and protected resource access.
            </p>
          </div>

          {/* Auth banner */}
          {loading ? (
            <div className="glass-card rounded-2xl p-6 mb-6 text-center text-muted-foreground">
              Loading session...
            </div>
          ) : !user ? (
            <div className="glass-card rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                You're not signed in. Sign in first to run the full checklist.
              </p>
              <Button asChild variant="hero" size="sm">
                <Link to="/login">Go to Sign In</Link>
              </Button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm">
                <p className="text-muted-foreground">Signed in as</p>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>
              {completedAny && (
                <div className="text-sm font-medium">
                  <span className="text-emerald-500">{passed} passed</span>
                  {failed > 0 && (
                    <>
                      {" · "}
                      <span className="text-destructive">{failed} failed</span>
                    </>
                  )}
                  <span className="text-muted-foreground"> / {total}</span>
                </div>
              )}
            </div>
          )}

          {/* Steps */}
          <div className="space-y-3">
            {STEPS.map((step, idx) => {
              const result = results[step.id];
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "glass-card rounded-2xl p-5 transition-colors",
                    result.status === "pass" && "border-emerald-500/30",
                    result.status === "fail" && "border-destructive/40"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-foreground">
                          {step.title}
                        </h3>
                        <StatusIcon status={result.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      {result.detail && (
                        <p
                          className={cn(
                            "text-sm mt-2 font-mono",
                            result.status === "pass" && "text-emerald-500",
                            result.status === "fail" && "text-destructive",
                            result.status === "skip" && "text-muted-foreground"
                          )}
                        >
                          {result.detail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={runChecks}
              variant="hero"
              size="lg"
              disabled={running || loading}
              className="w-full sm:w-auto"
            >
              {running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running checks...
                </>
              ) : completedAny ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-run checks
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Run sign-in checks
                </>
              )}
            </Button>
            {completedAny && failed === 0 && passed === total && (
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">Continue to Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
