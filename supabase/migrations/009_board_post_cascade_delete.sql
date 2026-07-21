-- board_posts 삭제 시 관련 comments/likes 정리를 DB 트리거로 처리.
-- 클라이언트(anon key + RLS)에서 직접 지우면 comments_delete_own/likes_delete_own 정책 때문에
-- 삭제 요청자 소유가 아닌 행은 조용히 스킵되어 고아 데이터가 남음.
-- SECURITY DEFINER로 RLS를 우회해 게시글 소유자 상관없이 연관 데이터를 전부 정리.
CREATE OR REPLACE FUNCTION public.cleanup_board_post_related()
RETURNS TRIGGER AS $$
BEGIN
  -- 게시글의 댓글들에 달린 좋아요 정리 (target_type='comment')
  DELETE FROM public.likes
  WHERE target_type = 'comment'
    AND target_id IN (
      SELECT id FROM public.comments WHERE target_type = 'post' AND target_id = OLD.id
    );

  -- 게시글의 댓글 정리
  DELETE FROM public.comments WHERE target_type = 'post' AND target_id = OLD.id;

  -- 게시글 자체에 달린 좋아요 정리
  DELETE FROM public.likes WHERE target_type = 'post' AND target_id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_cleanup_board_post_related
  AFTER DELETE ON public.board_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_board_post_related();
