-- 019_profiles_is_admin.sql
-- #125 role 체계 도입 (1단계: 스키마)
-- profiles에 is_admin 1컬럼 + 정책에서 쓸 헬퍼 함수.
-- role text enum을 두지 않는 이유: 등급이 일반/관리자 2개뿐이고 늘릴 계획이 없음.
-- 관리자 지정은 Supabase 콘솔에서 수동 UPDATE (코드 경로 없음, #153 운영 방식과 동일).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- RLS 정책 안에서 profiles를 직접 서브쿼리하면 profiles 자신의 RLS와 얽히므로
-- SECURITY DEFINER로 우회. search_path 고정은 definer 함수 필수 방어.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()), false);
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
