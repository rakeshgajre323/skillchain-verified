// Generates a certificate image using Lovable AI Gateway based on student details
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentName, rollNumber, purpose, issuerName } = await req.json();

    if (!studentName || !rollNumber || !purpose) {
      return new Response(
        JSON.stringify({ error: "studentName, rollNumber and purpose are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const issuer = issuerName || "Issuing Institute";
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
- Issued by: "${issuer}"
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
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const imageUrl =
      data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
      data?.choices?.[0]?.message?.images?.[0]?.url;

    if (!imageUrl) {
      console.error("No image in AI response", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "No image returned by AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-certificate-ai error", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
