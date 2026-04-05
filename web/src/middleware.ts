import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Skip auth check if Supabase is not configured (demo mode)
  if (!url || !key || url.length < 10) {
    return NextResponse.next();
  }

  const placeholders = ["YOUR_PROJECT", "tu_proyecto", "your-project", "example"];
  if (placeholders.some((p) => url.toLowerCase().includes(p.toLowerCase()))) {
    return NextResponse.next();
  }

  // Create a response to pass cookies through
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh the session — this extends the cookie if still valid
  const { data: { user } } = await supabase.auth.getUser();

  // If no valid session, redirect to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("expired", "1");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/projects/:path*",
  ],
};
