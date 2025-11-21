import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bjhlntqmlviqhmodrhuf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaGxudHFtbHZpcWhtb2RyaHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Nzk1NTAsImV4cCI6MjA3OTI1NTU1MH0.Kz6K5CoYx-XK6twXHLEQUn66orq53bvF-LSJq1W-lJw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);