-- 좋아요 COUNT race condition 제거 + 랭킹 좋아요 집계 1000행 상한 해결. (#36)
-- 기존 방식: 토글(INSERT/DELETE) 후 매번 likes 테이블 COUNT(*) 재계산.
--   1) 별도 요청이라 토글과 COUNT 사이에 다른 요청이 끼어들 수 있음
--   2) 랭킹 페이지는 likes 원본 행을 전부 select해서 JS로 집계 → PostgREST 기본
--      1000행 제한에 걸리면 좋아요 상위 항목이 누락됨
-- albums/board_posts에 like_count 캐시 컬럼을 두고 likes 트리거로 원자적으로
-- 증감시켜, 조회는 항상 단일 행 조회 또는 캐시 컬럼 정렬만으로 끝나게 한다.
-- comments는 랭킹 집계 대상이 아니라 범위 밖 (#36 스코프).

ALTER TABLE public.albums ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.board_posts ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;

-- 기존 데이터 백필
UPDATE public.albums a
SET like_count = (
  SELECT COUNT(*) FROM public.likes l
  WHERE l.target_type = 'album' AND l.target_id = a.id
);

UPDATE public.board_posts p
SET like_count = (
  SELECT COUNT(*) FROM public.likes l
  WHERE l.target_type = 'post' AND l.target_id = p.id
);

CREATE OR REPLACE FUNCTION public.sync_like_count()
RETURNS TRIGGER AS $$
DECLARE
  v_target_type TEXT := COALESCE(NEW.target_type, OLD.target_type);
  v_target_id UUID := COALESCE(NEW.target_id, OLD.target_id);
  v_delta INTEGER := CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END;
BEGIN
  IF v_target_type = 'album' THEN
    UPDATE public.albums SET like_count = like_count + v_delta WHERE id = v_target_id;
  ELSIF v_target_type = 'post' THEN
    UPDATE public.board_posts SET like_count = like_count + v_delta WHERE id = v_target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_sync_like_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_like_count();
