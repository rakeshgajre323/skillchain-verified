import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_credential_requests",
  title: "List credential requests",
  description:
    "List credential issuance requests visible to the signed-in user. Students see their own requests; institutes see requests addressed to them.",
  inputSchema: {
    status: z
      .string()
      .describe("Optional status filter, e.g. pending, approved or rejected.")
      .optional(),
    limit: z.number().int().describe("Maximum number of requests to return (default 20).").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated;
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    let query = supabaseForUser(ctx)
      .from("credential_requests")
      .select(
        "id, title, credential_type, description, student_full_name, student_appar_id, student_roll_number, status, rejection_reason, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(take);
    if (status) query = query.eq("status", status as never);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ count: data?.length ?? 0, requests: data ?? [] });
  },
});
