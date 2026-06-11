/* ========================================
   Supabase 클라이언트 초기화
   — 크레덴셜 누락 시 null 반환 (Mock 폴백)
   ======================================== */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] URL 또는 Key가 .env에 설정되지 않았습니다. Mock 모드로 동작합니다.');
}

/** Supabase 클라이언트 — 크레덴셜 없으면 null (서비스에서 useMock() 폴백) */
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;
