import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_institutes",
  title: "List institutes",
  description:
    "List institutes registered on the platform, with their user IDs — use these IDs as issuer_id when creating a credential request.",
  inputSchema: {
    search: z.string().describe("Optional case-insensitive name filter.").optional(),
    limit: z.number().int().describe("Maximum number of institutes to return (default 25).").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated;
    const take = Math.min(Math.max(limit ?? 25, 1), 100);
    let query = supabaseForUser(ctx)
      .from("profiles")
      .select("user_id, institute_name, website, address")
      .eq("role", "institute")
      .limit(take);
    if (search) query = query.ilike("institute_name", `%${search}%`);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ count: data?.length ?? 0, institutes: data ?? [] });
  },
});
