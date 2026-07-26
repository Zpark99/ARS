-- [소급] 이미 DB에 적용된 객체의 기록용. 재실행 금지 (already exists).
-- popular_albums, monthly_artists 뷰 최초 생성.
-- albums(001_albums.sql), ratings(002_comments_ratings.sql) 생성 이후에 와야 함
-- (파일명은 002_comments_ratings.sql보다 알파벳상 뒤에 오도록 명명해 읽기 순서를 보장함).
--
-- 007_score_numeric.sql이 score 타입 변경 시 이 뷰들을 DROP 후 재생성하지만
-- 뷰 정의 자체는 그때도 바뀌지 않음(007 파일 주석: "기존 정의 그대로") →
-- 007의 CREATE VIEW문과 동일한 정의를 그대로 최초 생성분으로 기록.

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
