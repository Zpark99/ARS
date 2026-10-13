-- 021_post_cleanup_immutable_triggers.sql
-- 마감-1 ① (Refs #148, #43). 트리거 3종:
--   (a) #148 gallery_posts 삭제 시 댓글·좋아요 정리 — 009 함수를 테이블별로 분기해 재사용
--   (b) #43  board_posts.board_type / gallery_posts.artist_id·post_flag 변경 차단
--   (c) comments 삭제 시 그 댓글의 좋아요 정리 + 기존 고아 좋아요 정리
--
-- CASCADE가 아니라 트리거인 이유: comments/likes.target_id는 다형성이라 FK가 없음(009와 같은 사정).
-- (b)를 RLS로 못 막는 이유: WITH CHECK는 OLD를 못 봄(020 주석 참고).
-- (b)는 UPDATE OF <컬럼> 트리거라 그 컬럼이 SET 절에 있을 때만 발동한다.
--   → sync_like_count()의 UPDATE ... SET like_count 는 발동 대상 자체가 아님(좋아요 집계 영향 없음).
-- (b)는 SQL Editor(postgres)에서도 막힌다. 운영상 바꿔야 하면 해당 트리거를 잠시 DISABLE.

BEGIN;

-- (a) 함수명은 009 그대로 둔다(board_posts 트리거 재생성 회피). gallery_posts에도 같이 붙는다.
CREATE OR REPLACE FUNCTION public.cleanup_board_post_related()
RETURNS TRIGGER AS $$
DECLARE
  v_type TEXT;
BEGIN
  v_type := CASE TG_TABLE_NAME WHEN 'gallery_posts' THEN 'gallery_post' ELSE 'post' END;

  -- 글의 댓글들에 달린 좋아요
  DELETE FROM public.likes
  WHERE target_type = 'comment'
    AND target_id IN (
      SELECT id FROM public.comments WHERE target_type = v_type AND target_id = OLD.id
    );

  -- 글의 댓글
  DELETE FROM public.comments WHERE target_type = v_type AND target_id = OLD.id;

  -- 글 자체의 좋아요
  DELETE FROM public.likes WHERE target_type = v_type AND target_id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_cleanup_gallery_post_related
  AFTER DELETE ON public.gallery_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_board_post_related();

-- (b) 차단 조건은 각 트리거의 WHEN에 두고, 함수는 막기만 한다.
CREATE OR REPLACE FUNCTION public.reject_column_change()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION '%.% 은(는) 변경할 수 없음', TG_TABLE_NAME, TG_ARGV[0];
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_board_posts_board_type_immutable
  BEFORE UPDATE OF board_type ON public.board_posts
  FOR EACH ROW
  WHEN (OLD.board_type IS DISTINCT FROM NEW.board_type)
  EXECUTE FUNCTION public.reject_column_change('board_type');

CREATE TRIGGER trg_gallery_posts_artist_immutable
  BEFORE UPDATE OF artist_id ON public.gallery_posts
  FOR EACH ROW
  WHEN (OLD.artist_id IS DISTINCT FROM NEW.artist_id)
  EXECUTE FUNCTION public.reject_column_change('artist_id');

-- 관리자는 허용(공지 지정). is_admin()은 019 헬퍼.
CREATE TRIGGER trg_gallery_posts_flag_admin_only
  BEFORE UPDATE OF post_flag ON public.gallery_posts
  FOR EACH ROW
  WHEN (OLD.post_flag IS DISTINCT FROM NEW.post_flag AND NOT public.is_admin())
  EXECUTE FUNCTION public.reject_column_change('post_flag');

-- (c) /api/comments/[id]의 좋아요 정리는 사용자 세션(RLS)이라 본인 좋아요만 지워졌음.
CREATE OR REPLACE FUNCTION public.cleanup_comment_likes()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.likes WHERE target_type = 'comment' AND target_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_cleanup_comment_likes
  AFTER DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_comment_likes();

-- 기존 고아 좋아요 (2026-10-13 기준 1건: e6cce8d9-…, 2026-07-23 생성)
DELETE FROM public.likes l
WHERE l.target_type = 'comment'
  AND NOT EXISTS (SELECT 1 FROM public.comments c WHERE c.id = l.target_id);

COMMIT;

-- 롤백(참고용, 필요 시 수동 실행). (a)(b)(c)는 서로 독립이라 블록 단위로 골라 써도 됨.
-- BEGIN;
-- -- (c)
-- DROP TRIGGER IF EXISTS trg_cleanup_comment_likes ON public.comments;
-- DROP FUNCTION IF EXISTS public.cleanup_comment_likes();
-- -- (b)
-- DROP TRIGGER IF EXISTS trg_board_posts_board_type_immutable ON public.board_posts;
-- DROP TRIGGER IF EXISTS trg_gallery_posts_artist_immutable ON public.gallery_posts;
-- DROP TRIGGER IF EXISTS trg_gallery_posts_flag_admin_only ON public.gallery_posts;
-- DROP FUNCTION IF EXISTS public.reject_column_change();
-- -- (a) 트리거 제거 + 함수 009 원문 복원
-- DROP TRIGGER IF EXISTS trg_cleanup_gallery_post_related ON public.gallery_posts;
-- CREATE OR REPLACE FUNCTION public.cleanup_board_post_related()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   DELETE FROM public.likes
--   WHERE target_type = 'comment'
--     AND target_id IN (
--       SELECT id FROM public.comments WHERE target_type = 'post' AND target_id = OLD.id
--     );
--   DELETE FROM public.comments WHERE target_type = 'post' AND target_id = OLD.id;
--   DELETE FROM public.likes WHERE target_type = 'post' AND target_id = OLD.id;
--   RETURN OLD;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- COMMIT;
--
-- 고아 좋아요 복원(대상 댓글이 없는 행이라 실익 없음, 기록용):
-- INSERT INTO public.likes (id, user_id, target_type, target_id, created_at) VALUES
--   ('e6cce8d9-ad2f-4402-8042-3c73c396567d', '958aaced-3465-4198-86e5-76c645ea65b0', 'comment',
--    'b077a5ae-69af-4114-b31b-d6e61b92ec56', '2026-07-23T12:12:16.816472+00:00');
