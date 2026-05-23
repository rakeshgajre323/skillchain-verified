// Generates a certificate image using Lovable AI Gateway based on student details
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sanitize = (v: unknown, max = 200) =>
  typeof v === "string"
    ? v.replace(/[\r\n`]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- AuthN: validate JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = userData.user.id;

    // --- AuthZ: must be active institute ---
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile, error: profErr } = await admin
      .from("profiles")
      .select("role,status")
      .eq("user_id", userId)
      .maybeSingle();
    if (profErr || !profile || profile.role !== "institute" || profile.status !== "active") {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ error: "Invalid request body" }, 400);
    }

    const studentName = sanitize((body as any).studentName, 120);
    const rollNumber = sanitize((body as any).rollNumber, 60);
    const purpose = sanitize((body as any).purpose, 300);
    const issuerName = sanitize((body as any).issuerName, 120) || "Issuing Institute";

    if (!studentName || !rollNumber || !purpose) {
      return json({ error: "studentName, rollNumber and purpose are required" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return json({ error: "AI not configured" }, 500);
    }

    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const prompt = `Design an elegant, formal CERTIFICATE OF ACHIEVEMENT image, landscape orientation, high resolution, premium look with ornate decorative borders, gold seal/ribbon, subtle background watermark.

The certificate must clearly display the following text exactly:
- Heading: "Certificate of Achievement"
- Main line: "This is to certify that"
- Student Name (large, prominent): "${studentName}"
- Roll Number: "${rollNumber}"
- Purpose / Achievement (concise sentence based on this): "${purpose}"
- Issued by: "${issuerName}"
- Date: "${today}"
- Signature line on bottom-left, official seal on bottom-right

Use clean serif typography, navy blue and gold color palette, and ensure ALL text is perfectly legible and spelled correctly. Do not add extra unrelated text.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      if (aiRes.status === 429) {
        return json({ error: "Rate limit reached. Please try again shortly." }, 429);
      }
      if (aiRes.status === 402) {
        return json({ error: "AI credits exhausted. Please add credits in workspace settings." }, 402);
      }
      return json({ error: "AI generation failed" }, 500);
    }

    const data = await aiRes.json();
    const imageUrl =
      data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
      data?.choices?.[0]?.message?.images?.[0]?.url;

    if (!imageUrl) {
      console.error("No image in AI response");
      return json({ error: "No image returned by AI" }, 500);
    }

    return json({ imageUrl });
  } catch (e) {
    console.error("generate-certificate-ai error", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
