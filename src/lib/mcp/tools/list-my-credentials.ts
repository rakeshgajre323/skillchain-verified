import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_my_credentials",
  title: "List my credentials",
  description:
    "List academic credentials visible to the signed-in user. Students see credentials issued to them; institutes see credentials they issued.",
  inputSchema: {
    limit: z.number().int().describe("Maximum number of credentials to return (default 20).").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated;
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    const { data, error } = await supabaseForUser(ctx)
      .from("credentials")
      .select(
        "id, title, description, credential_type, issuer_name, student_full_name, student_appar_id, student_roll_number, issued_date, expiry_date, verification_status",
      )
      .order("issued_date", { ascending: false })
      .limit(take);
    if (error) return errorResult(error.message);
    return jsonResult({ count: data?.length ?? 0, credentials: data ?? [] });
  },
});
