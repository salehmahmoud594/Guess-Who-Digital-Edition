import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ACCESS_TTL_MS = 12 * 60 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function secureEqual(expected: string, received: string) {
  const encoder = new TextEncoder();
  const expectedBytes = encoder.encode(expected);
  const receivedBytes = encoder.encode(received);
  const sameLength = expectedBytes.length === receivedBytes.length;
  const paddedReceived = sameLength ? receivedBytes : new Uint8Array(expectedBytes.length);
  const expectedKey = await crypto.subtle.importKey("raw", expectedBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const receivedKey = await crypto.subtle.importKey("raw", paddedReceived, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expectedDigest = new Uint8Array(await crypto.subtle.sign("HMAC", expectedKey, new Uint8Array()));
  const receivedDigest = new Uint8Array(await crypto.subtle.sign("HMAC", receivedKey, new Uint8Array()));
  let difference = sameLength ? 0 : 1;
  for (let index = 0; index < expectedDigest.length; index += 1) difference |= expectedDigest[index] ^ receivedDigest[index];
  return difference === 0;
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method-not-allowed" }, 405);

  const expectedPassword = Deno.env.get("GAME_ACCESS_PASSWORD");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authorization = request.headers.get("Authorization");

  if (!expectedPassword || !supabaseUrl || !serviceRoleKey || !anonKey || !authorization) {
    return json({ error: "misconfigured" }, 500);
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid-request" }, 400);
  }
  if (typeof body.password !== "string" || !(await secureEqual(expectedPassword, body.password))) {
    return json({ error: "invalid-password" }, 401);
  }

  const playerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await playerClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "unauthorized" }, 401);

  const expiresAt = new Date(Date.now() + ACCESS_TTL_MS).toISOString();
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: grantError } = await adminClient.from("game_access_grants").upsert({
    user_id: userData.user.id,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });
  if (grantError) return json({ error: "grant-failed" }, 500);

  return json({ granted: true, expiresAt });
});
