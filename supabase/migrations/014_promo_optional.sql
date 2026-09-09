-- #79: 홍보글 자유화. #78(013)에서 건 promo 필수 연결 제약을 되돌린다.
-- artist_id·album_id 컬럼은 유지(nullable) — 연결 안 한 promo 글도 허용.

ALTER TABLE public.board_posts
  DROP CONSTRAINT IF EXISTS board_posts_promo_requires_artist_album;
