// Supabase Edge Function: Brand Researcher
// Crawls website + Instagram, analyzes with LLM, pre-populates 8 YAMLs
// Deploy: supabase functions deploy brand-researcher
// Env vars: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RAILWAY_API_URL

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const railwayUrl = Deno.env.get("RAILWAY_API_URL") || "https://miroshark-production.up.railway.app";

  if (!geminiKey) return jsonResponse({ error: "GEMINI_API_KEY not configured" }, 500);

  const sb = createClient(supabaseUrl, supabaseKey);

  try {
    const { project_id, website_url, instagram_handle } = await req.json();
    if (!project_id) return jsonResponse({ error: "project_id required" }, 400);

    // ── 1. Crawl website via Railway Playwright (JS rendering) ─
    let websiteData: { title: string; text: string; url: string } | null = null;
    if (website_url) {
      // Try rendered endpoint first (Playwright), then plain fetch
      for (const endpoint of ["/api/graph/fetch-url-rendered", "/api/graph/fetch-url"]) {
        try {
          const fetchRes = await fetch(`${railwayUrl}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: website_url }),
          });
          if (fetchRes.ok) {
            const fetchData = await fetchRes.json();
            if (fetchData.success && fetchData.data?.text?.length > 50) {
              websiteData = fetchData.data;
              break;
            }
          }
        } catch (e) {
          console.error(`Fetch via ${endpoint} failed:`, e);
        }
      }
    }

    // ── 2. Extract social links from website text ─────────────
    const socialLinks: Array<{ platform: string; url: string; handle: string }> = [];
    if (websiteData?.text) {
      const socialPatterns = [
        { platform: "instagram", pattern: /instagram\.com\/([a-zA-Z0-9_.]+)/gi },
        { platform: "tiktok", pattern: /tiktok\.com\/@([a-zA-Z0-9_.]+)/gi },
        { platform: "facebook", pattern: /facebook\.com\/([a-zA-Z0-9_.]+)/gi },
        { platform: "twitter", pattern: /(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/gi },
        { platform: "youtube", pattern: /youtube\.com\/(?:@|channel\/)([a-zA-Z0-9_-]+)/gi },
        { platform: "linkedin", pattern: /linkedin\.com\/(?:company|in)\/([a-zA-Z0-9_-]+)/gi },
      ];

      for (const { platform, pattern } of socialPatterns) {
        let match;
        while ((match = pattern.exec(websiteData.text)) !== null) {
          const handle = match[1];
          if (handle && !socialLinks.some((l) => l.platform === platform && l.handle === handle)) {
            socialLinks.push({
              platform,
              url: match[0],
              handle,
            });
          }
        }
      }
    }

    // ── 3. Instagram public profile ──────────────────────────
    let instagramData: { bio: string; followers: number; posts_count: number } | null = null;
    const igHandle = instagram_handle?.replace("@", "") ||
      socialLinks.find((l) => l.platform === "instagram")?.handle;

    if (igHandle) {
      try {
        // Fetch IG profile page — meta tags have bio + follower count
        const igRes = await fetch(`https://www.instagram.com/${igHandle}/`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Viralscope/1.0)",
            "Accept": "text/html",
          },
        });
        if (igRes.ok) {
          const html = await igRes.text();
          // Extract from og:description: "N Followers, N Following, N Posts - ..."
          const ogMatch = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i);
          if (ogMatch) {
            const desc = ogMatch[1];
            const followersMatch = desc.match(/([\d,.]+[KMkm]?)\s*Followers/i);
            const postsMatch = desc.match(/([\d,.]+)\s*Posts/i);
            const bioMatch = desc.match(/Posts\s*-\s*(.*)/);

            const parseCount = (s: string): number => {
              if (!s) return 0;
              const clean = s.replace(/,/g, "");
              if (clean.match(/[Kk]$/)) return parseFloat(clean) * 1000;
              if (clean.match(/[Mm]$/)) return parseFloat(clean) * 1000000;
              return parseInt(clean) || 0;
            };

            instagramData = {
              bio: bioMatch?.[1]?.trim() || "",
              followers: parseCount(followersMatch?.[1] || "0"),
              posts_count: parseInt(postsMatch?.[1]?.replace(/,/g, "") || "0"),
            };
          }
        }
      } catch (e) {
        console.error("Instagram fetch failed:", e);
      }
    }

    // ── 4. LLM analysis — generate 8 YAMLs ──────────────────
    const researchContext = `
WEBSITE DATA:
${websiteData ? `Title: ${websiteData.title}\nURL: ${websiteData.url}\n\nContent:\n${websiteData.text.slice(0, 8000)}` : "No website data available."}

INSTAGRAM DATA:
${instagramData ? `Handle: @${igHandle}\nFollowers: ${instagramData.followers}\nPosts: ${instagramData.posts_count}\nBio: ${instagramData.bio}` : "No Instagram data available."}

SOCIAL LINKS FOUND:
${socialLinks.length > 0 ? socialLinks.map((l) => `- ${l.platform}: ${l.handle}`).join("\n") : "None found."}
`;

    const prompt = `Eres un estratega de marca analizando un negocio para crear su perfil completo.

${researchContext}

Genera 8 objetos JSON que representen el perfil de esta marca. Cada campo debe estar fundamentado en los datos reales encontrados. Si no tienes datos suficientes para un campo, pon valores razonables basados en el contexto.

Responde con un JSON estricto con estas 8 claves:

{
  "brand_yaml": {
    "name": "string",
    "tagline": "string (inferido del sitio)",
    "description": "string (2-3 oraciones)",
    "niche": "string",
    "positioning": "string",
    "market": { "country": "string", "language": "string" },
    "values": ["string"],
    "product_formats": [{ "name": "string", "price": "string", "description": "string" }]
  },
  "voice_yaml": {
    "tone": "string",
    "personality": "string",
    "formality": "casual | semiformal | formal",
    "vocabulary": { "use": ["string"], "avoid": ["string"] }
  },
  "audiences_yaml": {
    "segments": ["string — nombre descriptivo del segmento"],
    "total_personas": 0,
    "note": "Se expandiran a 50+ personas en el wizard"
  },
  "pillars_yaml": {
    "pillars": [{ "name": "string", "description": "string" }]
  },
  "competitors_yaml": {
    "competitors": [{ "name": "string", "positioning": "string" }]
  },
  "platforms_yaml": {
    "instagram": {
      "handle": "@string",
      "followers": 0,
      "engagement_rate": "string o null"
    }
  },
  "metrics_yaml": {
    "kpis": {
      "follower_growth": "string",
      "engagement_target": "string"
    }
  },
  "calendar_yaml": {
    "key_dates": [{ "date": "string", "event": "string" }]
  },
  "confidence": {
    "brand_yaml": "high | medium | low",
    "voice_yaml": "high | medium | low",
    "audiences_yaml": "high | medium | low",
    "pillars_yaml": "high | medium | low",
    "competitors_yaml": "high | medium | low",
    "platforms_yaml": "high | medium | low",
    "metrics_yaml": "high | medium | low",
    "calendar_yaml": "high | medium | low"
  },
  "summary": "string — resumen de 2-3 oraciones de lo encontrado"
}

Escribe TODO en espanol. Devuelve SOLO el JSON.`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "low" },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return jsonResponse({ error: "Gemini API error", details: errText.slice(0, 500) }, 502);
    }

    const geminiData = await geminiRes.json();
    const allParts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    const textPart = allParts.find((p: Record<string, unknown>) => typeof p.text === "string" && !p.thoughtSignature);
    const rawText = textPart?.text || allParts[allParts.length - 1]?.text || null;

    if (!rawText) return jsonResponse({ error: "Empty response from Gemini" }, 502);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) parsed = JSON.parse(match[1].trim());
      else return jsonResponse({ error: "Failed to parse JSON", raw: rawText.slice(0, 500) }, 502);
    }

    // ── 5. Save to Supabase ──────────────────────────────────
    const yamlFields: Record<string, unknown> = {};
    const yamlKeys = [
      "brand_yaml", "voice_yaml", "audiences_yaml", "pillars_yaml",
      "competitors_yaml", "platforms_yaml", "metrics_yaml", "calendar_yaml",
    ];
    const populatedYamls: string[] = [];

    for (const key of yamlKeys) {
      if (parsed[key] && typeof parsed[key] === "object") {
        yamlFields[key] = parsed[key];
        populatedYamls.push(key);
      }
    }

    yamlFields.research_data = {
      website: websiteData ? { title: websiteData.title, url: websiteData.url, char_count: websiteData.text.length } : null,
      instagram: instagramData,
      social_links: socialLinks,
      raw_confidence: parsed.confidence,
      researched_at: new Date().toISOString(),
    };
    yamlFields.onboarding_status = "wizard";

    await sb.from("projects").update(yamlFields).eq("id", project_id);

    const tokensUsed = geminiData?.usageMetadata?.totalTokenCount ?? null;

    // ── 6. Return report ─────────────────────────────────────
    return jsonResponse({
      success: true,
      report: {
        website: websiteData ? { title: websiteData.title, url: websiteData.url, pages_fetched: 1 } : null,
        instagram: instagramData,
        social_links: socialLinks,
        yamls_populated: populatedYamls,
        confidence: (parsed.confidence || {}) as Record<string, string>,
        summary: (parsed.summary || "Research completado.") as string,
      },
      tokens_used: tokensUsed,
    });
  } catch (error) {
    return jsonResponse({ error: "Internal error", message: String(error) }, 500);
  }
});
