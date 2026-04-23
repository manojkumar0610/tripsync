import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("Auth callback error:", error?.message);
    return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`);
  }

  // Ensure user profile exists in public.users table
  // This handles the case where the DB trigger hasn't fired yet
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", data.session.user.id)
    .single();

  if (!existingUser) {
    // Manually create user profile if trigger didn't run
    await supabase.from("users").upsert({
      id: data.session.user.id,
      email: data.session.user.email,
      full_name: data.session.user.user_metadata?.full_name ?? null,
      avatar_url: data.session.user.user_metadata?.avatar_url ?? null,
    }, { onConflict: "id", ignoreDuplicates: true });
  }

  // Build redirect URL — handle Vercel's forwarded host
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";

  let redirectBase: string;
  if (isLocal) {
    redirectBase = origin;
  } else if (forwardedHost) {
    redirectBase = `https://${forwardedHost}`;
  } else {
    redirectBase = origin;
  }

  return NextResponse.redirect(`${redirectBase}${next}`);
}
