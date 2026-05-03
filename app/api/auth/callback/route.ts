import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`);
  }

  // Use NEXT_PUBLIC_APP_URL if set (most reliable in production)
  // Fall back to x-forwarded-host (Vercel proxy), then origin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const forwardedHost = request.headers.get("x-forwarded-host");

  let base: string;
  if (appUrl) {
    // Explicit env var — most reliable
    base = appUrl.replace(/\/$/, "");
  } else if (forwardedHost) {
    // Vercel reverse proxy
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    base = `${proto}://${forwardedHost}`;
  } else {
    base = origin;
  }

  return NextResponse.redirect(`${base}${next}`);
}
