-- board_posts: 홍보글 팀 선택/수기입력 자율화 (#116, Refs #101)
-- 014에서 artist_id/album_id 필수 CHECK를 이미 없앴지만, 클라이언트가 다시 둘 다
-- 필수로 검증하고 있어(#114/PR#115) artists 테이블에 없는 팀(#101 매칭 갭)은
-- 홍보 자체가 불가능했다. 수기 팀명 입력을 허용해 우회한다.
-- album은 계속 선택 사항(album_id는 013에서 이미 nullable, 변경 없음).

ALTER TABLE public.board_posts
  ADD COLUMN artist_name_text TEXT;

-- promo 글은 artist_id(선택) 또는 artist_name_text(수기) 중 하나는 있어야 함.
-- album_id는 필수 아님. qa/updates는 계속 둘 다 NULL 허용(조건은 board_type='promo'일 때만 적용).
ALTER TABLE public.board_posts
  ADD CONSTRAINT board_posts_promo_requires_artist_or_text
  CHECK (board_type <> 'promo' OR (artist_id IS NOT NULL OR artist_name_text IS NOT NULL));
