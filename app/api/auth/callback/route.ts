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
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`);
  }

  // Ensure user profile exists — DB trigger sometimes lags on first login
  const { data: existingProfile } = await supabase
    .from("users")
    .select("id")
    .eq("id", data.session.user.id)
    .maybeSingle();

  if (!existingProfile) {
    await supabase.from("users").upsert(
      {
        id: data.session.user.id,
        email: data.session.user.email,
        full_name: data.session.user.user_metadata?.full_name ?? null,
        avatar_url: data.session.user.user_metadata?.avatar_url ?? null,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
  }

  // Handle Vercel reverse-proxy host
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (process.env.NODE_ENV === "development" || !forwardedHost) {
    return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`https://${forwardedHost}${next}`);
}
