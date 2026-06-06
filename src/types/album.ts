export interface AlbumRow {
  id: string           // uuid (PK) — ratings/comments의 FK 대상
  mbid: string         // MusicBrainz Release ID (UNIQUE)
  title: string
  artist_name: string
  cover_url: string | null
}

export interface CommentRow {
  id: string
  user_id: string      // auth.users.id 참조
  album_id: string     // albums.id 참조
  content: string
  created_at: string
}

// GET /api/ratings?album_id= 응답 구조
export interface RatingSummary {
  avg: number | null   // 평균 별점 (평가 없으면 null)
  count: number        // 평가 수
  myScore: number | null // 로그인 유저의 별점 (비로그인 또는 미평가 시 null)
}
