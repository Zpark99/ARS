-- board_posts: 홍보(promo) 탭이 앨범 허브에서 album_id로 필터링할 때 쓸 인덱스.
-- 컬럼/RLS 변경 없음, 조회 성능용 부분 인덱스만 추가 (#100).
-- board_type='promo'가 아닌 행이나 album_id가 비어있는 행은 인덱스에서 제외.

CREATE INDEX IF NOT EXISTS idx_board_posts_promo_album
  ON public.board_posts (album_id)
  WHERE board_type = 'promo' AND album_id IS NOT NULL;
