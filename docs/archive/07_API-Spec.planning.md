> ⚠️ **이 문서는 2026/08 피벗 시점의 기획본입니다. 실제 구현과 다릅니다.**
> 주요 차이: Spotify → 실제 MusicBrainz + Cover Art Archive / posts 통합 테이블 → 실제
> board_posts(promo·qa·update) + gallery_posts 분리 / gallery_subscriptions·notifications
> 실기능·monthly_ranking VIEW·is_admin(role) 등은 미구현(v1.1).
>
> **현재 실제 상태 참조:**
> - 스키마: [`../03_ERD.md`](../03_ERD.md)
> - 배포 상태·회귀: `08_Deployment-Checklist.md` — 레포에는 아직 없음, 이슈 [#73](https://github.com/Zpark99/ARS/issues/73)로 진행 예정
> - 기능 개요: 루트 [`README.md`](../../README.md)
> - API·아키텍처 실제: 코드(`app/api/`, `app/`)가 정본
>
> 이 문서는 "피벗 당시 계획"의 기록으로만 보존하며 정정하지 않습니다.

# API-Spec — ARS (피벗)

> ✅ 확정 · 🔒 인증 필요 · 🛡️ 관리자 · 🥶 콜드스타트 관련<br>선행: 03 ERD · 04 Architecture · 06 Screen · 후행: 08 Deployment

---

## 0. 문서 정보 ✅

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.2 (기획, 디자인 완료) |
| 작성일 | 2026/08/22 |
| 작성자 | 박진재 |
| 접근 방식 | 대부분 Supabase 클라이언트 직접 조회(RLS) · 서버 필요 시만 Route Handler |

---

## 0. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v0.0(초안) | 08/09 | 최초 작성 |
| v0.1 | 08/20 | 갤러리 팀별 전환(gallery_id→artist_id, post_flag 필터), gallery_subscriptions·album_requests 엔드포인트 추가, 로그인 구글 OAuth 확정 |
| v0.2 | 08/22 | 문서 오류 수정 |

---

## 1. 접근 원칙 ✅

- **읽기/쓰기 대부분**: Supabase 클라이언트 SDK 직접 (RLS가 권한 강제).
- **Route Handler(서버) 전용**: Spotify 임포트(client_secret 보호), 서버 집계.
- 아래는 논리 오퍼레이션 기준. Supabase 직접은 테이블·정책으로, 서버 경유는 `/api/*`.

---

## 2. 인증 (Auth) — 구글 OAuth ✅

| 오퍼레이션 | 방식 | 인증 | 비고 |
|---|---|---|---|
| 구글 로그인 | Supabase Auth (OAuth) | — | **구글 OAuth 단일** (이메일/비번 없음) |
| 로그아웃 | Supabase Auth SDK | — | |
| 세션 조회 | `auth.getUser()` | — | **401(미인증)/500(오류) 명시 분기** (04 §3) |

> ⚠️ getUser() 실패를 미인증/네트워크 오류로 구분. 미인증 → /login, 오류 → 재시도 UI.

---

## 3. 앨범 · 가수 (Spotify + 갤러리) 🛡️

| 오퍼레이션 | 방식 | 인증 | 요청 | 응답 |
|---|---|---|---|---|
| 앨범 목록/검색 | Supabase select | anon | 필터(장르·연도)·키셋 커서 | album[] |
| 앨범 상세(허브) | Supabase select | anon | album_id | album + 집계 |
| 가수(갤러리) 상세 | Supabase select | anon | artist_id | artist + post_count·subscriber_count |
| Spotify 임포트 | `POST /api/admin/spotify-import` | 🛡️ is_admin | { spotify_id } | upsert 결과 |

**Spotify 임포트 규칙**
```plain text
upsert albums/artists ON CONFLICT (spotify_id) WHERE is_verified = false
· 토큰은 서버 환경변수 · is_verified=true 레코드 보호(덮어쓰기 제외)
```

---

## 4. 앨범 등록 요청 (album_requests) 🆕🔒

> 검색 0 빈 상태 → 등록 요청. **유저측만 정식 구현, 승인은 Supabase 콘솔 수동**(관리자 UI 로드맵).

| 오퍼레이션 | 방식 | 인증 | 요청 | 응답 |
|---|---|---|---|---|
| 등록 요청 생성 | Supabase insert | 🔒 | { album_name, artist_name?, spotify_url? } | request (status=pending) |
| 내 요청 조회 | Supabase select | 🔒 | — | request[] (본인 것만) |
| 승인/반려 | **Supabase 콘솔 수동** | 🛡️ | status 변경 | — (UI 없음) |

---

## 5. 게시글 (posts) ✅

board_type = gallery | promo | qa | update. 하나의 테이블, 정책으로 분기.

| 오퍼레이션 | 방식 | 인증 | 요청 | 응답 |
|---|---|---|---|---|
| 목록(게시판별) | Supabase select | anon | board_type, 키셋 커서 | post[] |
| 팀 갤러리 목록 | Supabase select | anon | board_type=gallery, **artist_id**, post_flag?, 커서 | post[] |
| 앨범 연결글(허브) | Supabase select | anon | album_id, board_type | post[] |
| 상세 | Supabase select | anon | post_id | post + author |
| 작성 | Supabase insert | 🔒 | { board_type, title, content, artist_id?, album_id?, post_flag? } | post |
| 수정/삭제 | Supabase update/delete | 🔒 본인 | post_id | post / — |
| 공지 작성(update) | Supabase insert | 🛡️ | 관리자만 | post |

> ⚠️ gallery_id → **artist_id** (팀 갤러리). post_flag(notice/concept/normal) 필터 추가.<br>목록은 offset 금지·키셋 커서(1000행 한계). board_type=update 쓰기는 is_admin RLS.

---

## 6. 댓글 · 좋아요 ✅

| 오퍼레이션 | 방식 | 인증 | 요청 | 응답 |
|---|---|---|---|---|
| 댓글 목록 | Supabase select | anon | post_id | comment[] |
| 댓글 작성 | Supabase insert | 🔒 | { post_id, content } | comment |
| 좋아요 토글 | Supabase insert/delete | 🔒 | { target_type(post/comment/album), target_id } | — |

**좋아요 동시성 (04 §4.1)**
```plain text
INSERT ... ON CONFLICT (user_id,target_type,target_id) DO NOTHING  (토글 해제=DELETE)
· check-then-insert 금지 · target_type='album' = HOT 투표 = 앨범 허브 헤더 하트 탭
```

---

## 7. 팔로우 · 갤러리 구독 · 알림 ✅

| 오퍼레이션 | 방식 | 인증 | 요청 | 응답 |
|---|---|---|---|---|
| 팔로우/언팔로우 | Supabase insert/delete | 🔒 | { following_id } | — |
| 팔로워/팔로잉 목록 | Supabase select | anon | user_id | profile[] |
| 갤러리 구독/해제 🆕 | Supabase insert/delete | 🔒 | { artist_id } | — |
| 내 구독 갤러리 🆕 | Supabase select | 🔒 | — | artist[] |
| 알림 목록 | Supabase select | 🔒 수신자 | 키셋 커서 | notification[] |
| 알림 읽음 | Supabase update | 🔒 본인 | notification_id | — |

> 알림 생성: 팔로우·댓글 발생 시 트리거/함수로 insert (recipient=대상, actor=행위자).<br>팔로우(유저→유저)와 구독(유저→갤러리/artist)은 별개 테이블.

---

## 8. 평점 · 랭킹 ✅

| 오퍼레이션 | 방식 | 인증 | 요청 | 응답 |
|---|---|---|---|---|
| 평점 등록/수정 | Supabase upsert | 🔒 | { album_id, score(0.0~5.0) } | rating |
| 월간 TOP/HOT | Supabase select (VIEW) | anon | type(top/hot), month | ranking[] |

**랭킹 (03 §4)**: TOP = AVG(score) / HOT = 앨범 좋아요 수 / 동점 = 소수 자리 확장 타이브레이킹. `monthly_ranking` VIEW.

---

## 9. 공통 규칙 ✅

- **에러 포맷**: `{ error: { code, message } }`. 에러 스왈로잉 금지 — 명시 throw.
- **페이지네이션**: 전 목록 키셋 커서 `?cursor=<created_at>&limit=N`.
- **RLS**: 모든 쓰기는 `auth.uid()` 소유 검증. 열람은 공개 테이블 anon.

---

## 10. 다음 문서 연결 ✅

- **08 Deployment-Checklist**: `/api/*` 환경변수(Spotify)·RLS 검증·잔여 이슈 회귀 테스트.
