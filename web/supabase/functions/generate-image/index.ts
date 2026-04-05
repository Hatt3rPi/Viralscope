// Supabase Edge Function: Generate Image via Higgsfield NanoBanana 2
// Deploy: supabase functions deploy generate-image
// Env vars needed: HF_CREDENTIALS (format: KEY_ID:KEY_SECRET)

const HF_API_URL =
  "https://platform.higgsfield.ai/higgsfield-ai/nano-banana-2/text-to-image";

Deno.serve(async (req: Request) => {
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
    const { prompt_string, negative_prompt, aspect_ratio, slot_id, variant_label } =
      await req.json();

    if (!prompt_string) {
      return new Response(JSON.stringify({ error: "prompt_string required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const credentials = Deno.env.get("HF_CREDENTIALS");
    if (!credentials) {
      return new Response(
        JSON.stringify({ error: "HF_CREDENTIALS not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Build prompt (append negative as part of prompt since NanoBanana doesn't have separate negative field)
    const fullPrompt = negative_prompt
      ? `${prompt_string}. Avoid: ${negative_prompt}`
      : prompt_string;

    // Call NanoBanana 2 API
    const hfResponse = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${credentials}`,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        aspect_ratio: aspect_ratio || "9:16",
        resolution: "2K",
      }),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      return new Response(
        JSON.stringify({ error: "NanoBanana API error", status: hfResponse.status, details: errorText }),
        { status: 502, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const hfData = await hfResponse.json();

    // NanoBanana returns queued status — poll for completion
    if (hfData.status === "queued" || hfData.status === "in_progress") {
      const statusUrl = hfData.status_url;
      const requestId = hfData.request_id;

      // Poll up to 120 seconds (NanoBanana takes ~10-30s typically)
      let result = hfData;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));

        const pollResponse = await fetch(statusUrl, {
          headers: { Authorization: `Key ${credentials}` },
        });
        result = await pollResponse.json();

        if (result.status === "completed" || result.status === "failed" || result.status === "nsfw") {
          break;
        }
      }

      if (result.status === "completed" && result.images?.[0]?.url) {
        const imageUrl = result.images[0].url;

        // Optionally upload to Supabase Storage for persistence
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        let storedUrl = imageUrl; // fallback to HF URL

        if (supabaseUrl && supabaseKey) {
          try {
            const imageResponse = await fetch(imageUrl);
            const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
            const timestamp = Date.now();
            const filePath = `images/${slot_id || "unknown"}/${variant_label || "X"}/${timestamp}.png`;

            const uploadResponse = await fetch(
              `${supabaseUrl}/storage/v1/object/media/${filePath}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${supabaseKey}`,
                  "Content-Type": "image/png",
                },
                body: imageBytes,
              }
            );

            if (uploadResponse.ok) {
              storedUrl = `${supabaseUrl}/storage/v1/object/public/media/${filePath}`;
            }
          } catch {
            // Storage upload failed — use HF URL as fallback
          }
        }

        return new Response(
          JSON.stringify({
            image_url: storedUrl,
            request_id: requestId,
            status: "completed",
          }),
          {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }

      if (result.status === "nsfw") {
        return new Response(
          JSON.stringify({ error: "Image flagged as NSFW", request_id: requestId }),
          { status: 422, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Generation timed out or failed", status: result.status, request_id: requestId }),
        { status: 504, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Direct response (unlikely but handle)
    return new Response(JSON.stringify(hfData), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
