import { createClient } from "@supabase/supabase-js";

// Admin client using service role key — bypasses RLS.
// Only use server-side (server actions, API routes). Never expose to the browser.
export function createAdminClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url || !serviceKey) {
    const missing = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
