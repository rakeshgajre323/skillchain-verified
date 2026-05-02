import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerifyOtpRequest {
  userId: string;
  code: string;
}

// Verify OTP against stored salt:hash using SHA-256
async function verifyOtp(code: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, expectedHash] = parts;
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === expectedHash;
}

async function logEvent(
  admin: ReturnType<typeof createClient>,
  payload: {
    user_id?: string | null;
    email?: string | null;
    event_type: string;
    outcome: string;
    attempts?: number | null;
    error_message?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  try {
    await admin.from("otp_audit_log").insert({
      user_id: payload.user_id ?? null,
      email: payload.email ?? null,
      event_type: payload.event_type,
      outcome: payload.outcome,
      attempts: payload.attempts ?? null,
      error_message: payload.error_message ?? null,
      metadata: payload.metadata ?? {},
    });
  } catch (e) {
    console.error("Failed to write otp_audit_log:", e);
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, code }: VerifyOtpRequest = await req.json();

    if (!userId || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP format. Must be 6 digits." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return new Response(
        JSON.stringify({ error: "Invalid user identifier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Authenticate caller and assert it matches the requested userId.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user || userData.user.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Block suspended accounts from re-activating via OTP.
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();
    if (profile?.status === "suspended") {
      return new Response(
        JSON.stringify({ error: "Account is suspended. Please contact support." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching OTP:", fetchError);
      return new Response(
        JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpRecord) {
      await logEvent(supabaseAdmin, {
        user_id: userId,
        email: userData.user.email,
        event_type: "otp_verify",
        outcome: "no_code",
      });
      return new Response(
        JSON.stringify({ error: "No verification code found. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabaseAdmin.from("otp_codes").delete().eq("user_id", userId);
      await logEvent(supabaseAdmin, {
        user_id: userId,
        email: userData.user.email,
        event_type: "otp_verify",
        outcome: "expired",
        attempts: otpRecord.attempts,
      });
      return new Response(
        JSON.stringify({ error: "Verification code has expired. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (otpRecord.attempts >= 5) {
      await supabaseAdmin.from("otp_codes").delete().eq("user_id", userId);
      await logEvent(supabaseAdmin, {
        user_id: userId,
        email: userData.user.email,
        event_type: "otp_verify",
        outcome: "too_many_attempts",
        attempts: otpRecord.attempts,
      });
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please request a new verification code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isValid = await verifyOtp(code, otpRecord.code_hash);

    if (!isValid) {
      const newAttempts = otpRecord.attempts + 1;
      await supabaseAdmin
        .from("otp_codes")
        .update({ attempts: newAttempts })
        .eq("user_id", userId);

      const remainingAttempts = Math.max(0, 5 - newAttempts);
      await logEvent(supabaseAdmin, {
        user_id: userId,
        email: userData.user.email,
        event_type: "otp_verify",
        outcome: "invalid_code",
        attempts: newAttempts,
        metadata: { remaining_attempts: remainingAttempts },
      });
      return new Response(
        JSON.stringify({
          error: remainingAttempts > 0
            ? `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`
            : "Invalid verification code. No attempts remaining — please request a new code.",
          remainingAttempts,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ status: "active" })
      .eq("user_id", userId)
      .eq("status", "pending");

    if (updateError) {
      console.error("Error updating profile status:", updateError);
      await logEvent(supabaseAdmin, {
        user_id: userId,
        email: userData.user.email,
        event_type: "otp_verify",
        outcome: "activation_failed",
        error_message: updateError.message,
      });
      return new Response(
        JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabaseAdmin.from("otp_codes").delete().eq("user_id", userId);

    await logEvent(supabaseAdmin, {
      user_id: userId,
      email: userData.user.email,
      event_type: "otp_verify",
      outcome: "success",
      attempts: otpRecord.attempts + 1,
    });

    console.log(`OTP verified successfully for user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email verified successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
