"use client";
import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

// Lightweight read of the current signed-in user's email, kept in sync with auth
// state changes. Used by the nav to show a sign-in vs sign-out control.
type UserMeta = { avatar_url?: string; picture?: string } | undefined;
const avatarOf = (meta: UserMeta): string | null => meta?.avatar_url ?? meta?.picture ?? null;

export function useUser() {
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setEmail(data.user?.email ?? null);
      setAvatarUrl(avatarOf(data.user?.user_metadata as UserMeta));
      setReady(true);
    })();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setEmail(session?.user?.email ?? null);
      setAvatarUrl(avatarOf(session?.user?.user_metadata as UserMeta));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { email, avatarUrl, ready };
}
