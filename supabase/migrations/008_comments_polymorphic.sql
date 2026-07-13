-- comments: album_id → target_type/target_id 다형성 전환
-- likes와 동일한 구조. 게시판(board_posts) 댓글 지원.
-- 참조 뷰/트리거 없음 확인됨 (DROP 불필요)

-- 1. 새 컬럼 추가 (nullable로 먼저)
ALTER TABLE public.comments ADD COLUMN target_type TEXT;
ALTER TABLE public.comments ADD COLUMN target_id UUID;

-- 2. 기존 데이터 백필 (전부 앨범 코멘트)
UPDATE public.comments
SET target_type = 'album',
    target_id = album_id
WHERE target_type IS NULL;

-- 3. NOT NULL + CHECK 적용
ALTER TABLE public.comments ALTER COLUMN target_type SET NOT NULL;
ALTER TABLE public.comments ALTER COLUMN target_id SET NOT NULL;
ALTER TABLE public.comments ADD CONSTRAINT comments_target_type_check
  CHECK (target_type IN ('album', 'post'));

-- 4. 기존 album_id 제거 (FK도 같이 사라짐)
ALTER TABLE public.comments DROP COLUMN album_id;

-- 5. 조회 성능 인덱스
CREATE INDEX idx_comments_target ON public.comments (target_type, target_id, created_at DESC);

-- 6. likes에 'post' 허용 (게시판 글 좋아요)
ALTER TABLE public.likes DROP CONSTRAINT likes_target_type_check;
ALTER TABLE public.likes ADD CONSTRAINT likes_target_type_check
  CHECK (target_type IN ('album', 'comment', 'post'));