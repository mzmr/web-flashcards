import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types";
import { SUPABASE_URL, SUPABASE_KEY } from "astro:env/server";

export const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);
export type SupabaseClient = typeof supabaseClient;
