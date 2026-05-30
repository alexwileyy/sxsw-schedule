"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { isAllowedEmail } from "@/lib/auth";

// Shortlist ("My Picks") backed by the Supabase `picks` table so it syncs across
// devices. Keeps the original useShortlist() interface so the components that use
// it don't change - the storage just moved from localStorage to the database.
//
// State lives at module level and is shared by every useShortlist() subscriber via
// a small listener set; each mutation updates the local Set optimistically, then
// writes to Supabase and reverts on failure. Saving requires a signed-in,
// allow-listed user (see lib/auth); when logged out, `authed` is false and the
// mutation helpers no-op so the caller can route to /login instead.

const supabase = createClient();

let ids = new Set<string>();
let authed = false;
let ready = false;
let userId: string | null = null;

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

async function load() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && isAllowedEmail(user.email)) {
    userId = user.id;
    authed = true;
    const { data } = await supabase.from("picks").select("event_id");
    ids = new Set((data ?? []).map((r: { event_id: string }) => r.event_id));
  } else {
    userId = null;
    authed = false;
    ids = new Set();
  }
  ready = true;
  emit();
}

let started = false;
function ensureStarted() {
  if (started) return;
  started = true;
  void load();
  // Reload picks whenever auth state changes (sign-in / sign-out).
  supabase.auth.onAuthStateChange(() => {
    void load();
  });
}

export function useShortlist() {
  const [, force] = useState(0);

  useEffect(() => {
    ensureStarted();
    const onChange = () => force((v) => v + 1);
    listeners.add(onChange);
    onChange();
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const has = useCallback((id: string) => ids.has(id), []);

  const toggle = useCallback(async (id: string) => {
    if (!authed || !userId) return false;
    const adding = !ids.has(id);

    // Optimistic update.
    const next = new Set(ids);
    if (adding) next.add(id);
    else next.delete(id);
    ids = next;
    emit();

    const res = adding
      ? await supabase.from("picks").insert({ user_id: userId, event_id: id })
      : await supabase.from("picks").delete().eq("user_id", userId).eq("event_id", id);

    if (res.error) {
      // Revert on failure.
      const reverted = new Set(ids);
      if (adding) reverted.delete(id);
      else reverted.add(id);
      ids = reverted;
      emit();
    }
    return true;
  }, []);

  const clear = useCallback(async () => {
    if (!authed || !userId) return;
    const prev = ids;
    ids = new Set();
    emit();
    const { error } = await supabase.from("picks").delete().eq("user_id", userId);
    if (error) {
      ids = prev;
      emit();
    }
  }, []);

  return { ids, has, toggle, clear, authed, ready };
}
