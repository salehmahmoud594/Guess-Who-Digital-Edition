import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

if (!isSupabaseConfigured) {
  console.warn("[Supabase] Configuration is missing. Local play modes are active.");
}

export const supabase = isSupabaseConfigured
  ? createClient(url!, publishableKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : (null as unknown as ReturnType<typeof createClient>);

export async function ensureAnonymousPlayer() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: existing, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (existing.session?.user) return existing.session.user;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) throw error ?? new Error("Unable to create a player session.");
  return data.user;
}

export async function gameAccessGranted() {
  if (!isSupabaseConfigured || !supabase) return true;
  try {
    await ensureAnonymousPlayer();
    const { data, error } = await supabase
      .from("game_access_grants")
      .select("expires_at")
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    if (error) return true;
    return Boolean(data);
  } catch {
    return true;
  }
}

export async function verifyGameAccess(password: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { granted: true as const, expiresAt: new Date(Date.now() + 86400000).toISOString() };
  }
  await ensureAnonymousPlayer();
  const { data, error } = await supabase.functions.invoke("verify-game-access", { body: { password } });
  if (error) throw error;
  if (!data?.granted) throw new Error("That password doesn’t match. Please try again.");
  return data as { granted: true; expiresAt: string };
}
