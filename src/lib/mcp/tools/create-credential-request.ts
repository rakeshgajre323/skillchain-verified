import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "create_credential_request",
  title: "Request a credential",
  description:
    "Create a credential issuance request from the signed-in student to an institute. The institute reviews and approves it in the app.",
  inputSchema: {
    issuer_id: z.string().describe("User ID of the institute the request is sent to."),
    title: z.string().describe("Title of the requested credential, e.g. 'B.Tech Degree Certificate'."),
    credential_type: z.string().describe("Type of credential, e.g. degree, diploma, certificate."),
    description: z.string().describe("Why the credential is needed.").optional(),
    roll_number: z.string().describe("The student's roll number at the institute.").optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  needsApproval: true,
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated;
    const supabase = supabaseForUser(ctx);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name, phone, appar_id")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (profileError) return errorResult(profileError.message);
    if (!profile) return errorResult("No profile found for this account.");
    if (profile.role !== "student") return errorResult("Only students can request credentials.");

    const { data, error } = await supabase
      .from("credential_requests")
      .insert({
        student_id: ctx.getUserId(),
        issuer_id: input.issuer_id,
        title: input.title,
        credential_type: input.credential_type,
        description: input.description ?? null,
        student_full_name: profile.full_name,
        student_email: ctx.getUserEmail() ?? null,
        student_appar_id: profile.appar_id,
        student_phone: profile.phone,
        student_roll_number: input.roll_number ?? null,
      })
      .select("id, title, status, created_at")
      .maybeSingle();
    if (error) return errorResult(error.message);
    return jsonResult(data);
  },
});
