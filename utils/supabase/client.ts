import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Memoise so the whole client shares one GoTrueClient instance (avoids the
// "Multiple GoTrueClient instances detected" warning and duplicate auth listeners).
let client: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (client) return client;
  client = createBrowserClient(supabaseUrl!, supabaseKey!);
  return client;
};
