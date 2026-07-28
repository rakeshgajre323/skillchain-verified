import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

/** Supabase client scoped to the signed-in MCP caller (RLS runs as that user). */
export function supabaseForUser(ctx: ToolContext) {
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  return createClient(
    env.SUPABASE_URL!,
    env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export const unauthenticated = {
  content: [{ type: "text" as const, text: "Not authenticated" }],
  isError: true,
};

export const errorResult = (message: string) => ({
  content: [{ type: "text" as const, text: message }],
  isError: true,
});

export const jsonResult = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  structuredContent: { data } as Record<string, unknown>,
});
