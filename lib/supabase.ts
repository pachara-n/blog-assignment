import { createClient } from '@supabase/supabase-js'

// Public client — ใช้ anon key ซึ่งถูก expose ให้ browser ได้ (NEXT_PUBLIC_ prefix)
// อยู่ภายใต้ Row Level Security (RLS) ของ Supabase
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client — ใช้ service role key ที่ bypass RLS ทั้งหมด
// ต้องใช้เฉพาะใน server-side (API route) เท่านั้น ห้าม import ใน Client Component เด็ดขาด
// เพราะถ้ารั่วไปที่ browser ใครก็อ่าน/เขียน DB ได้โดยไม่ต้อง auth
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
