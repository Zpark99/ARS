-- gallery_posts 좋아요 지원 (#150, #104 백로그 해소)
-- board_posts와 동일한 패턴(010_like_count_columns.sql) 재사용:
-- likes.target_type CHECK 확장 + like_count 캐시 컬럼 + 공용 트리거 함수 확장.

ALTER TABLE public.likes DROP CONSTRAINT likes_target_type_check;
ALTER TABLE public.likes ADD CONSTRAINT likes_target_type_check
  CHECK (target_type IN ('album', 'comment', 'post', 'gallery_post'));

ALTER TABLE public.gallery_posts ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;

-- 기존 데이터 백필 (현재는 gallery_post 좋아요가 없어 전부 0이지만, 원칙대로 재계산)
UPDATE public.gallery_posts p
SET like_count = (
  SELECT COUNT(*) FROM public.likes l
  WHERE l.target_type = 'gallery_post' AND l.target_id = p.id
);

-- sync_like_count()에 gallery_post 분기 추가 (010에서 만든 함수 재사용/확장)
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
  ELSIF v_target_type = 'gallery_post' THEN
    UPDATE public.gallery_posts SET like_count = like_count + v_delta WHERE id = v_target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- 트리거(trg_sync_like_count)는 이미 likes에 붙어 있어 재생성 불필요.
