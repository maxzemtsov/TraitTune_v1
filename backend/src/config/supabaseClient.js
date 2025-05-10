const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
  // Depending on the application's error handling strategy, you might throw an error or exit.
  // For now, we'll just log the error and export a null client.
  // module.exports = null; 
  // However, it's better to throw an error to catch this early in development.
  throw new Error("Supabase URL or Anon Key is missing.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
