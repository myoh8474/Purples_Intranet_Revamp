/* ========================================
   Supabase 클라이언트 초기화
   ======================================== */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] URL 또는 Key가 .env에 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
