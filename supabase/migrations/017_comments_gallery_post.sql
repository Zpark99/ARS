-- comments target_type에 'gallery_post' 추가 (#147)
-- 갤러리 글 댓글을 QA(target_type='post')와 동일한 comments 테이블로 통일.
-- CHECK 넓히기라 기존 album/post 데이터에는 영향 없음.

ALTER TABLE public.comments DROP CONSTRAINT comments_target_type_check;
ALTER TABLE public.comments ADD CONSTRAINT comments_target_type_check
  CHECK (target_type IN ('album', 'post', 'gallery_post'));

-- 롤백(참고용, 필요 시 수동 실행):
-- gallery_post 행이 하나라도 있으면 아래 롤백은 CHECK 위반으로 실패함.
-- ALTER TABLE public.comments DROP CONSTRAINT comments_target_type_check;
-- ALTER TABLE public.comments ADD CONSTRAINT comments_target_type_check
--   CHECK (target_type IN ('album', 'post'));
