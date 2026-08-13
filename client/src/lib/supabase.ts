import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error("Supabase public configuration is missing.");
}

export const supabase = createClient(url, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

export async function ensureAnonymousPlayer() {
  const { data: existing, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (existing.session?.user) return existing.session.user;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) throw error ?? new Error("Unable to create a player session.");
  return data.user;
}

export async function gameAccessGranted() {
  await ensureAnonymousPlayer();
  const { data, error } = await supabase
    .from("game_access_grants")
    .select("expires_at")
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function verifyGameAccess(password: string) {
  await ensureAnonymousPlayer();
  const { data, error } = await supabase.functions.invoke("verify-game-access", { body: { password } });
  if (error) throw error;
  if (!data?.granted) throw new Error("That password doesn’t match. Please try again.");
  return data as { granted: true; expiresAt: string };
}
