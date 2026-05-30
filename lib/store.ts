"use client";
import { useEffect, useState, useCallback } from "react";

const KEY = "sxsw-london-2026.shortlist.v1";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function write(set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify([...set]));
}

// A simple module-level event so multiple useShortlist subscribers stay in sync.
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export function useShortlist() {
  const [version, setVersion] = useState(0);
  const [ids, setIds] = useState<Set<string>>(() => read());

  useEffect(() => {
    const onChange = () => {
      setIds(read());
      setVersion((v) => v + 1);
    };
    listeners.add(onChange);
    window.addEventListener("storage", onChange);
    // hydrate (in case server rendered an empty set)
    onChange();
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const next = new Set(read());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    write(next);
    emit();
  }, []);

  const has = useCallback((id: string) => ids.has(id), [ids]);

  const clear = useCallback(() => {
    write(new Set());
    emit();
  }, []);

  return { ids, has, toggle, clear, version };
}
