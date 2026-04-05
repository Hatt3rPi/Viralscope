// Supabase Edge Function: Generate Image via Gemini API
// Deploy: supabase functions deploy generate-image
// Set secret: supabase secrets set GEMINI_API_KEY=AIzaSy...

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent";

Deno.serve(async (req: Request) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { prompt_string, negative_prompt, slot_id, variant_label } =
      await req.json();

    if (!prompt_string) {
      return new Response(JSON.stringify({ error: "prompt_string required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build the full prompt
    const fullPrompt = negative_prompt
      ? `${prompt_string}\n\nAvoid: ${negative_prompt}`
      : prompt_string;

    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return new Response(
        JSON.stringify({
          error: "Gemini API error",
          details: errorText,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();

    // Extract image from response
    const parts = geminiData?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(
      (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData
    );

    if (!imagePart?.inlineData?.data) {
      return new Response(
        JSON.stringify({
          error: "No image in response",
          response: geminiData,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const base64Data = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || "image/png";

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
      c.charCodeAt(0)
    );
    const timestamp = Date.now();
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const filePath = `images/${slot_id}/${variant_label}/${timestamp}.${ext}`;

    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/media/${filePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": mimeType,
        },
        body: imageBytes,
      }
    );

    if (!uploadResponse.ok) {
      // Return base64 as fallback
      return new Response(
        JSON.stringify({
          image_base64: base64Data,
          mime_type: mimeType,
          storage_error: await uploadResponse.text(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${filePath}`;

    return new Response(
      JSON.stringify({
        image_url: publicUrl,
        file_path: filePath,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal error",
        message: String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
