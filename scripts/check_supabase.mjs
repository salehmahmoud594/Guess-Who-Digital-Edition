import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

async function testConnection() {
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("\n================ SUPABASE CONNECTION TEST ================");
  console.log("Target URL:", url);
  console.log("Publishable Key Present:", Boolean(key));
  console.log("Service Role Key Configured:", Boolean(serviceKey && !serviceKey.includes("your-service-role-key")));

  if (!url || !key) {
    console.error("❌ Missing URL or Publishable Key in .env!");
    return;
  }

  const supabase = createClient(url, key);

  try {
    const authEndpoint = `${url}/auth/v1/settings`;
    const resp = await fetch(authEndpoint, { headers: { apikey: key } });
    if (resp.ok) {
      console.log("✅ [1/2] Connection to Supabase Auth API: SUCCESSFUL (HTTP 200)");
    } else {
      console.error(`❌ [1/2] HTTP Auth failed with status ${resp.status}`);
    }
  } catch (e) {
    console.error("❌ [1/2] Could not reach Supabase endpoint:", e.message);
  }

  try {
    const { data: authData, error: anonError } = await supabase.auth.signInAnonymously();
    if (anonError) {
      console.log("ℹ️ Anonymous auth:", anonError.message);
    } else {
      console.log("✅ [2/3] Anonymous Player Auth Session Created:", authData?.user?.id);
    }
  } catch (e) {
    console.error("❌ Anonymous Auth Error:", e.message);
  }

  try {
    const { data, error } = await supabase.from("game_rooms").select("id").limit(1);
    if (error) {
      console.log("ℹ️ [3/3] Query game_rooms table response:", error.message, `(Code: ${error.code})`);
    } else {
      console.log("✅ [3/3] Query game_rooms table: SUCCESSFUL!");
    }
  } catch (e) {
    console.error("❌ Database query error:", e.message);
  }
  console.log("==========================================================\n");
}

testConnection();
