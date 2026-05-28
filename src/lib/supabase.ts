import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Untyped client — avoids complex generic inference issues across the codebase
export const supabase = createClient(url, key);
export const isSupabaseConfigured = () => !!url && !!key && !url.includes("TU-PROYECTO");
