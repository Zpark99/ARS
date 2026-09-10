# ARS (Album Review Service)

좋아하는 앨범을 검색하고, 평점과 코멘트를 남기고, 다른 사람과 취향을 공유하는 앨범 리뷰 서비스입니다.

**배포 링크**: [ars-eta-one.vercel.app](https://ars-eta-one.vercel.app)

<!-- TODO: 스크린샷 추가 -->

## 핵심 기능

- **앨범**: MusicBrainz API 연동 검색 → 상세 페이지에서 평점(0.5 단위) · 코멘트 작성
- **소셜**: 좋아요(앨범 / 코멘트 / 게시판 글), 팔로우 / 언팔로우, 공개 프로필
- **게시판**: 갤러리 · QA · 업데이트 3종, 댓글 · 좋아요 지원
- **랭킹**: 평점순 / 좋아요순 / 코멘트순 정렬
- **아카이브**: 아티스트 검색, 최신순 / 평점순 필터
- **마이페이지**: 내가 남긴 평점 · 코멘트 · 좋아요 · 갤러리 글 모아보기

## 기술 스택

- **Framework**: Next.js (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Backend / DB / Auth**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Test**: Vitest
- **Deploy**: Vercel

## 아키텍처 하이라이트

**다형성(polymorphic) 설계**
`likes`, `comments` 테이블은 대상을 고정하지 않고 `target_type` / `target_id` 조합으로 앨범·코멘트·게시판 글을 모두 가리킵니다. 좋아요·댓글 기능이 늘어나도 테이블을 새로 만들지 않고 `target_type` 값만 추가하면 되도록 설계했습니다. (`003_likes.sql`, `008_comments_polymorphic.sql`)

**RLS 기반 데이터 격리 + SECURITY DEFINER 트리거**
모든 테이블에 Row Level Security를 적용해 "본인 데이터만 수정/삭제" 규칙을 DB 레벨에서 강제합니다. 그 위에 두 가지 트리거를 SECURITY DEFINER로 운영합니다:
- 신규 가입 시 `auth.users` → `public.profiles` 자동 생성 (`005_profiles.sql`)
- 좋아요 토글 시 `albums` / `board_posts`의 `like_count` 캐시 컬럼을 원자적으로 증감 — 매 조회마다 `likes` 테이블을 COUNT하던 방식에서 발생하던 race condition과, 랭킹 집계 시 PostgREST 1000행 제한으로 상위 항목이 누락되던 문제를 함께 해결했습니다 (`010_like_count_columns.sql`)

**마이그레이션 파일 기반 스키마 관리**
스키마 변경은 전부 `supabase/migrations/*.sql` 파일로 남기고, DB에는 파일을 통해서만 적용합니다. 컬럼 타입 변경처럼 파괴적인 변경(예: 평점 SMALLINT → NUMERIC(2,1) 0.5단위 전환)도 의존 뷰 DROP → 변경 → 재생성까지 한 마이그레이션에 담아 이력으로 남깁니다 (`007_score_numeric.sql`).

**검증 로직 분리 + Vitest 테스트**
평점 범위, 코멘트 길이, 게시판 제목/본문 등 입력 검증을 `src/lib/validation/`에 UI와 분리된 순수 함수로 두고, 각각에 대응하는 Vitest 테스트를 작성했습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

`.env.local`에 아래 환경변수가 필요합니다 (값은 Supabase 프로젝트 설정에서 확인):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

```bash
npm run lint   # ESLint
npm run test   # Vitest
npm run build  # 프로덕션 빌드
```
