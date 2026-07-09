-- ratings.score: SMALLINT(정수) → numeric(2,1)(0.5 단위)
-- score를 참조하는 뷰 2개를 DROP → 타입변경 → 재생성

-- 1. 의존 뷰 제거
DROP VIEW IF EXISTS public.popular_albums;
DROP VIEW IF EXISTS public.monthly_artists;

-- 2. score 타입 변경
ALTER TABLE public.ratings DROP CONSTRAINT ratings_score_check;
ALTER TABLE public.ratings ALTER COLUMN score TYPE numeric(2,1);
ALTER TABLE public.ratings ADD CONSTRAINT ratings_score_check
  CHECK (score >= 0.5 AND score <= 5 AND score * 2 = floor(score * 2));

-- 3. 뷰 재생성 (기존 정의 그대로)
CREATE VIEW public.popular_albums AS
  SELECT a.id,
    a.mbid,
    a.title,
    a.artist_name,
    a.cover_url,
    count(r.id) AS rating_count,
    COALESCE(round(avg(r.score), 1), 0::numeric) AS avg_score
   FROM albums a
     LEFT JOIN ratings r ON r.album_id = a.id
  GROUP BY a.id
 HAVING count(r.id) > 0
  ORDER BY (count(r.id)) DESC, (COALESCE(round(avg(r.score), 1), 0::numeric)) DESC;

CREATE VIEW public.monthly_artists AS
  SELECT a.artist_name,
    count(r.id) AS rating_count,
    COALESCE(round(avg(r.score), 1), 0::numeric) AS avg_score,
    min(a.cover_url) AS sample_cover
   FROM albums a
     JOIN ratings r ON r.album_id = a.id
  WHERE r.created_at >= date_trunc('month'::text, now())
  GROUP BY a.artist_name
  ORDER BY (count(r.id)) DESC;