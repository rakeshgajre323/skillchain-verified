import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "ok" | "deny">("loading");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setState("deny");
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setState(data ? "ok" : "deny");
    })();
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (state === "deny") return <Navigate to="/sys-control-7k9x2m" replace />;
  return <>{children}</>;
}
