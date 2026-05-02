import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

type Role = "student" | "institute" | "company";

interface RequireAuthProps {
  children: ReactNode;
  /** Roles allowed to view this route. Omit to allow any signed-in user. */
  roles?: Role[];
  /** If true (default), require profile.status === 'active'. Set false to allow pending users. */
  requireActive?: boolean;
}

/**
 * Frontend access guard. Enforces:
 *   1. Authenticated session (otherwise redirect to /login)
 *   2. profile.status === 'active' if requireActive (otherwise → /verify-otp)
 *   3. profile.role ∈ roles (otherwise → /dashboard with deny banner)
 *
 * NOTE: This is a UX guard. True authorization is enforced by RLS in the
 * database and explicit checks in edge functions — never trust the client.
 */
export function RequireAuth({ children, roles, requireActive = true }: RequireAuthProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // No profile row yet — treat as not-yet-onboarded.
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.status === "suspended") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-bold text-destructive">Account Suspended</h1>
          <p className="text-muted-foreground">
            Your account has been suspended. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  if (requireActive && profile.status !== "active") {
    return <Navigate to="/verify-otp" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            Your role ({profile.role}) doesn&apos;t have access to this page.
          </p>
          <a href="/dashboard" className="text-primary underline inline-block mt-2">
            Go to dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
