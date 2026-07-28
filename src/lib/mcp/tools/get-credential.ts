import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "get_credential",
  title: "Get credential details",
  description:
    "Fetch the full details of one credential by its ID, including verification status. Only credentials the signed-in user may access are returned.",
  inputSchema: {
    credential_id: z.string().describe("The UUID of the credential."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ credential_id }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated;
    const { data, error } = await supabaseForUser(ctx)
      .from("credentials")
      .select(
        "id, title, description, credential_type, issuer_name, student_full_name, student_email, student_appar_id, student_roll_number, issued_date, expiry_date, verification_status, metadata, created_at",
      )
      .eq("id", credential_id)
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("Credential not found or not accessible.");
    return jsonResult(data);
  },
});
