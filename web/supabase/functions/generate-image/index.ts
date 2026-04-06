// Supabase Edge Function: Generate Image via NanoBanana 2 (Gemini 3.1 Flash Image)
// Deploy: supabase functions deploy generate-image
// Env vars needed: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const NANOBANANA_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt_string, negative_prompt, aspect_ratio, image_size, slot_id, variant_label } =
      await req.json();

    if (!prompt_string) {
      return jsonResponse({ error: "prompt_string required" }, 400);
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return jsonResponse({ error: "GEMINI_API_KEY not configured" }, 500);
    }

    // Build prompt — append negative as avoidance instructions
    const fullPrompt = negative_prompt
      ? `${prompt_string}\n\nIMPORTANT: Avoid the following in the image: ${negative_prompt}`
      : prompt_string;

    // Call NanoBanana 2 (Gemini 3.1 Flash Image)
    const geminiBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: aspect_ratio || "9:16",
          imageSize: image_size || "2K",
        },
      },
    };

    const geminiRes = await fetch(`${NANOBANANA_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return jsonResponse(
        { error: "NanoBanana 2 API error", status: geminiRes.status, details: errText },
        502
      );
    }

    const geminiData = await geminiRes.json();

    // Check for safety blocks
    const finishReason = geminiData?.candidates?.[0]?.finishReason;
    if (
      finishReason === "SAFETY" ||
      finishReason === "IMAGE_SAFETY" ||
      finishReason === "IMAGE_PROHIBITED_CONTENT"
    ) {
      return jsonResponse(
        { error: "Image blocked by safety filter", finishReason },
        422
      );
    }

    // Extract base64 image from response
    const parts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (p: Record<string, unknown>) => p.inline_data
    );

    if (!imagePart?.inline_data?.data) {
      return jsonResponse(
        {
          error: "No image in response",
          finishReason: finishReason || "unknown",
          raw: geminiData,
        },
        502
      );
    }

    const base64Data = imagePart.inline_data.data as string;
    const mimeType = (imagePart.inline_data.mime_type as string) || "image/png";
    const extension = mimeType.includes("jpeg") ? "jpg" : "png";

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    let imageUrl = `data:${mimeType};base64,${base64Data.slice(0, 50)}...`; // fallback

    if (supabaseUrl && supabaseKey) {
      try {
        // Decode base64 to bytes
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const timestamp = Date.now();
        const filePath = `images/${slot_id || "unknown"}/${variant_label || "X"}/${timestamp}.${extension}`;

        const uploadRes = await fetch(
          `${supabaseUrl}/storage/v1/object/media/${filePath}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": mimeType,
            },
            body: bytes,
          }
        );

        if (uploadRes.ok) {
          imageUrl = `${supabaseUrl}/storage/v1/object/public/media/${filePath}`;
        } else {
          console.error("Storage upload failed:", await uploadRes.text());
          // Return base64 data URL as fallback
          imageUrl = `data:${mimeType};base64,${base64Data}`;
        }
      } catch (storageErr) {
        console.error("Storage error:", storageErr);
        imageUrl = `data:${mimeType};base64,${base64Data}`;
      }
    }

    return jsonResponse({
      image_url: imageUrl,
      status: "completed",
      model: "gemini-3.1-flash-image-preview",
      finish_reason: finishReason,
    });
  } catch (error) {
    console.error("generate-image error:", error);
    return jsonResponse(
      { error: "Internal error", message: String(error) },
      500
    );
  }
});
