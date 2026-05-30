import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAllowedEmail } from "@/lib/auth";

// Google redirects here with a one-time code. We exchange it for a session,
// then verify the email is on the allow-list - anyone else is signed straight
// back out and bounced to /login with an error.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/picks";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user && isAllowedEmail(user.email)) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=unauthorized`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
