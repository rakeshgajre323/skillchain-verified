import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOtpRequest {
  userId: string;
  code: string;
}

// Pre-computed dummy hash for constant-time responses
// This ensures all code paths take approximately the same time
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

// Secure verification using bcrypt
async function verifyOtp(code: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(code, hash);
}

// Perform dummy bcrypt operation to ensure constant-time response
async function performDummyVerification(code: string): Promise<void> {
  await bcrypt.compare(code, DUMMY_HASH);
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, code }: VerifyOtpRequest = await req.json();

    if (!userId || !code) {
      // Perform dummy verification to maintain constant time
      await performDummyVerification(code || "000000");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      await performDummyVerification(code);
      return new Response(
        JSON.stringify({ error: "Invalid OTP format. Must be 6 digits." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate userId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      await performDummyVerification(code);
      return new Response(
        JSON.stringify({ error: "Invalid user identifier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get OTP record for user
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching OTP:", fetchError);
      await performDummyVerification(code);
      return new Response(
        JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpRecord) {
      // Perform dummy verification to prevent timing-based user enumeration
      await performDummyVerification(code);
      return new Response(
        JSON.stringify({ error: "No verification code found. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabaseAdmin.from("otp_codes").delete().eq("user_id", userId);
      // Perform dummy verification to maintain constant time
      await performDummyVerification(code);
      return new Response(
        JSON.stringify({ error: "Verification code has expired. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await supabaseAdmin.from("otp_codes").delete().eq("user_id", userId);
      // Perform dummy verification to maintain constant time
      await performDummyVerification(code);
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please request a new verification code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the provided code using bcrypt (this is the real verification)
    const isValid = await verifyOtp(code, otpRecord.code_hash);

    if (!isValid) {
      // Increment attempts
      await supabaseAdmin
        .from("otp_codes")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("user_id", userId);

      const remainingAttempts = 4 - otpRecord.attempts;
      return new Response(
        JSON.stringify({ 
          error: `Invalid verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : 'No attempts remaining.'}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // OTP is valid - update user status to active
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ status: "active" })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating profile status:", updateError);
      return new Response(
        JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete the OTP record
    await supabaseAdmin.from("otp_codes").delete().eq("user_id", userId);

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
