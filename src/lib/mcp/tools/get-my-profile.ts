import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "get_my_profile",
  title: "Get my profile",
  description:
    "Get the signed-in user's profile: role (student, institute or company), name, APAAR ID, institute/company name and account status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated;
    const { data, error } = await supabaseForUser(ctx)
      .from("profiles")
      .select(
        "role, full_name, phone, appar_id, institute_name, company_name, website, address, status",
      )
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("No profile found for this account.");
    return jsonResult({ ...data, email: ctx.getUserEmail() });
  },
});
