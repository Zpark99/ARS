# 화면정의서 (Screen Definitions) — ARS (피벗)

> ✅ 확정 · 🔒 로그인 게이트 · 🥶 콜드스타트 빈 상태 · 🛡️ 관리자
> 선행: [02 IA](./02_IA-Sitemap.md) · [05 Design-System](./05_Design-System.md) · 대상: Figma 프레임
> 원칙: 열람 개방 · 참여 게이트 · 빈 상태는 "행동 유도" · 화면 = 컴포넌트 조립
>
> §4의 GlobalHeader/TabBar/GlobalFooter 구현 디테일은 노션 "component spec" 페이지 내용을 병합한 것 — 05 §3.4의 컴포넌트 목록과 중복되지 않도록 이 문서에만 둠.

## 0. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.3 |
| 작성일 | 2026/08/26 |
| 작성자 | 박진재 |
| 반응형 | 767px 분기 (모바일 우선) |
| 웹 컨테이너 | 1364px |

**변경 이력**

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v0.0 | 08/12 | 최초 작성 |
| v0.1 | 08/18 | 홈 4섹션 재정비, 갤러리 팀별 전환(§2.4 재작성) |
| v0.2 | 08/20 | `[cat]`→`[artistId]` 정리, `/gallery/all` 반영, 좋아요=하트 탭 통합, 로그인 구글 OAuth, 컴포넌트 표 통합 |
| v0.2 | 08/22 | 문서 내용 수정 |
| v0.3 | 08/26 | Promo → 자유홍보형식으로 전환, 앨범허브 관련 선택형식으로 변경 |

## 1. 화면 목록 (= Figma 프레임, 웹/모바일 2벌)

홈 · 아카이브 · **앨범 허브** · 갤러리 홈 · 전체 갤러리 · 팀별 갤러리 · 글 상세 · 홍보게시판 · 홍보글 상세 · 프로필 · 알림 · Q&A · 업데이트 · 검색 · 로그인

## 2. 핵심 화면 상세

### 2.1 홈 `/` — 콘텐츠 허브 (4섹션)

> 단순 랭킹 리스트 → **4개 섹션이 쌓인 콘텐츠 허브**로 재정비. 컨테이너 1364 · 섹션 간 gap 20.

**① 월간 앨범 (972) + 실시간 피드 (372)** — `972 + gap20 + 372 = 1364`
- **좌 (972)**: 섹션 헤더 "월간 앨범 · 최근 30일" + TOP/HOT 토글(CategoryTab)
  - **AlbumCard(grid) × 5** 가로 정렬. 커버 우상단 뱃지 오버레이 (TOP=★평점 / HOT=♥좋아요 수)
  - 우측 화살표(›)로 다음 5개 캐러셀
- **우 (372)**: 섹션 헤더 "실시간 피드" + **FeedItem × N** 스트림
- **인터랙션**: 카드 클릭 → 앨범 허브 / TOP·HOT 토글 / 화살표 = 페이지 이동
- **🥶 빈 상태**: "아직 등록된 앨범이 없습니다 → 앨범 허브로"

**② 갤러리 핫글 (672) + 홍보게시판 (672)** — `672 + gap20 + 672 = 1364`
- **좌 (672)**: 섹션 헤더 + 더보기→ / **GalleryRow × N** (인기순)
- **우 (672)**: 섹션 헤더 + 더보기→ / **PromoCard × N** (최신순)
- **인터랙션**: 행·카드 클릭 → 글 상세 / 더보기 → `/gallery` · `/promo`
- **🥶 빈 상태**: "첫 글의 주인공이 되세요" / "첫 홍보글을 올려보세요"

**③ 앨범 허브 리뷰 (1364)**
- 4열 그리드 — 각 칸 = **AlbumCard + 그 아래 리뷰 텍스트**
- **인터랙션**: 앨범 클릭 → 허브 / 리뷰 클릭 → 해당 반응
- **🥶 빈 상태**: "아직 리뷰가 없어요"

**④ 최근 발매 앨범 (1364)**
- **AlbumCard(grid) × 4** + 좌우 화살표(‹ ›) 캐러셀. 최신 발매일 순
- **인터랙션**: 카드 클릭 → 앨범 허브
- **🥶 빈 상태**: "곧 새 앨범이 올라옵니다"

**모바일 (<768)**: 전 섹션 단일 컬럼 세로 스택. 캐러셀은 가로 스와이프(화살표 숨김). ②는 상하 분리(갤러리 위·홍보 아래), ③④는 가로 스크롤. 하단 TabBar 고정.

> **RankCard 폐기 (홈)**: TOP/HOT을 AlbumCard 뱃지로 대체하며 홈에서 RankCard 미사용. (랭킹 전용 페이지 시 재활용, 아니면 폐기 후보)

### 2.2 아카이브 `/archive` — 앨범 카탈로그

- **조립**: AlbumGrid(AlbumCard grid × N) + 필터(장르·연도)·정렬·검색바
- **인터랙션**: 앨범 클릭 → 허브 / 필터 = 키셋 쿼리
- **🥶 검색 0**: "그런 앨범이 없어요 → 등록 요청하기🔒" (album_requests 폼)

### 2.3 앨범 허브 `/album/[id]` — 피벗의 심장

- **조립**: AlbumCard(header) + HubTabs + (탭별 내용)
- **좋아요**: 헤더 **하트 탭 = HOT 투표** (별도 버튼 없음, 탭 = 토글) 🔒
- **HubTabs (기본=홍보)**:

  | 탭 | 조립 |
  |---|---|
  | 홍보 ✅기본 | PromoCard × N (이 앨범 연결 홍보글) |
  | 갤러리 | GalleryRow × N (이 앨범 언급 글, album_id 필터) |
  | 반응 | CommentItem × N + 좋아요 |
  | 정보 | 메타 + RatingStars(강등 노출) |

- **인터랙션**: 탭 전환 / PromoCard → 홍보글 상세
- **🥶 빈 상태**: 탭별 "아직 없어요 + 첫 글 쓰기🔒"

### 2.4 갤러리 (팀별)

**갤러리 홈 `/gallery`**
- ① 개념글 (인기글 하이라이트, GalleryRow × N, 2열)
- ② HOT 인기 갤러리 (팀 순위) + 게시판·안내 사이드
- ③ 갤러리 전체보기 (10팀 카드) + 더보기 → `/gallery/all`

**전체 갤러리 `/gallery/all` 🆕**
- 정렬(인기·가나다·신설) + 검색 + GalleryCard 그리드(순위·이름·글수·구독)
- 페이지네이션

**팀별 갤러리 `/gallery/[artistId]`** ⚠️ 기존 `[cat]` 대체
- 갤러리명 + 구독 버튼(SubscribeButton🔒) + 글쓰기🔒
- 필터: 전체 / 개념글 / 공지 (post_flag 기반)
- GalleryRow × N — 공지·개념 라벨(초록) 앞에, 방문한 글 흐리게
- 🥶 "첫 글의 주인공이 되세요"

### 2.5 홍보게시판 `/promo` · `/promo/[postId]`

- **조립**: 목록 = PromoCard × N / 상세 = 본문 + (연결 시)앨범 카드 + CommentItem + FollowButton
- **작성🔒**: 제목 + 본문 **필수**. 팀·앨범 연결은 **선택(optional)**
  - 팀 선택: **검색형 콤보박스** (타이핑 필터, 안 골라도 작성 가능)
  - 앨범 선택: 팀 선택 시에만 노출, 역시 선택
  - 연결 시 → 그 팀 갤러리·앨범 허브 홍보 탭에 노출 / 미연결 → 자유 홍보글로 홍보게시판·홈 피드에만
- **인터랙션**: (연결 시)연결앨범 → 허브 / 팔로우 → 알림 발생
- **🥶 빈 상태**: "첫 홍보글을 올려보세요"

> 자유 홍보 허용이 핵심 — 앨범 없는 공연·근황 홍보도 가능. 연결은 "하면 좋은" 보너스(앨범 허브로 트래픽 흐름).

### 2.6 프로필 `/profile/[id]`

- **조립**: Avatar(lg) + 자기소개 + 팔로워/팔로잉 수 + 활동내역 + FollowButton (본인이면 편집🔒)
- **인터랙션**: 팔로워 수 → 목록 / 활동 → 대상

### 2.7 알림 `/notifications` 🔒

- **조립**: NotificationItem × N
- **인터랙션**: 클릭 → 대상 + is_read 처리
- **🥶 빈 상태**: "새 소식이 여기 모여요"

## 3. 표준 화면 (간략)

- **글 상세 `/gallery/[artistId]/[postId]`**: 본문 + CommentItem × N + Composer🔒 + 좋아요
- **Q&A `/board/qa`**: GalleryRow 패턴 재사용(답변대기/완료 라벨) + 글쓰기🔒
- **업데이트 `/board/update`**: 공지 목록 (읽기 전용, 🛡️ 관리자 작성)
- **검색 `/search`**: 앨범·가수·글 3탭 결과 (앨범=AlbumCard / 가수=GalleryCard / 글=GalleryRow)
- **로그인 `/login`**: **구글 OAuth 단일**. 게이트 진입 시 직전 화면 복귀

## 4. 공용 레이아웃 (전 화면 공통)

> 05 Design-System 토큰만 사용 (하드코딩 금지). 토큰: `bg #050505` · `surface #100F12` · `surface-raised #16151A` · `border #1F1F22` · `text #EDEDED` · `text-muted #9A9AA0` · `accent #A3E635` · `accent-fg #050505`. 타이포: display 28/36·700 / title 20/28·600 / subtitle 16/24·600 / body 14/22·400 / caption 12/16·400. radius: sm 6 · md 10 · lg 14 · full. 반응형 분기 767px.

### 4.1 GlobalHeader (웹, ≥768)

**용도**: 전 페이지 상단 고정 내비게이션.

**구조** (가로 Auto Layout, 좌우 space-between):
- 높이 56px, 배경 `bg`, 하단 border 1px (`border` 토큰), `sticky top-0 z-50`
- 좌우 padding 24px, 요소 간 gap 24px
- **좌측**: 로고 "ARS" (accent 색, subtitle 16/24 600) — 클릭 시 `/`
- **중앙 내비**: 홈 · 아카이브 · 갤러리 · 홍보 · Q&A · 업데이트 (body 14/22)
  - 기본 `text-muted`, 현재 페이지 = `text`(활성), hover = `text`
  - 각 항목 라우트: `/` `/archive` `/gallery` `/promo` `/board/qa` `/board/update`
- **우측**: 검색 아이콘 → `/search` · 알림🔔 → `/notifications`
  - 비로그인: "로그인" 텍스트 버튼 (accent)
  - 로그인: 아바타(sm) + "{닉네임}님" (body) + "로그아웃"

**상태**:
- 로그인/비로그인 2가지 (우측 영역만 다름)
- 활성 메뉴 = 현재 라우트 매칭 (`usePathname`)

**모바일 (<768)**: 이 컴포넌트 숨김 → 축약 헤더(로고 + 알림🔔만)로 교체, 하단은 TabBar. 실제로는 GlobalHeader 안에서 반응형 처리하거나 MobileHeader 별도로 둘지는 구현 시 판단.

### 4.2 TabBar (모바일, <768, 하단 고정)

**용도**: 모바일 하단 고정 탭. 웹에선 숨김.

**구조** (가로 Auto Layout, 4등분 균등):
- 높이 ~56px, 배경 `bg`(또는 `surface`), 상단 border 1px, `fixed bottom-0 w-full z-50`
- 4탭 균등 분할 (각 flex-1, 세로: 아이콘 위 + 라벨 아래 중앙 정렬)
- **탭 4개**: 홈(`/`) · 아카이브(`/archive`) · 홍보(`/promo`) · 더보기
  - 아이콘 + 라벨(caption 12/16)
  - 기본 `text-muted`, 활성 = `accent` (아이콘+라벨 둘 다)
- **더보기** 탭: 탭 시 시트/메뉴 (갤러리·Q&A·업데이트·프로필·로그아웃)

**상태**: 활성 탭 = `accent` / 나머지 `text-muted`. 현재 라우트 매칭.

**표시 조건**: `<768`에서만 (`md:hidden` 또는 미디어쿼리).

### 4.3 GlobalFooter (전 화면 공통)

**용도**: 페이지 최하단 푸터.

**구조** (가로 Auto Layout, 좌우 space-between):
- 상단 border 1px, 배경 `bg`, padding 세로 16px 좌우 24px
- **좌측**: 로고 "ARS" (accent, caption~body) + 링크들 "패치내역 · 이용약관 · 문의" (`text-muted`, caption)
- **우측**: "© 2026 ARS" (`text-muted`, caption)

**상태**: 없음 (정적).

**반응형**: 모바일에선 세로 스택 가능 (좌측 링크 위, 카피라이트 아래). TabBar가 하단 고정이라 푸터는 그 위에 스크롤로 노출.

### 4.4 구현 노트 (공용 레이아웃 3종 공통)

- 색·폰트·radius·spacing = **05 Design-System 토큰만** (하드코딩 금지). 예: `bg-bg` `text-accent` `text-muted` `border-border` `text-body` 등
- 활성 라우트 판정 = `usePathname()` (App Router)
- 로그인 상태 = 서버 세션(`createClient`) 또는 클라 훅. GlobalHeader는 서버에서 세션 받아 넘기는 패턴이 이미 `layout.tsx`에 있음
- 아이콘 = lucide-react 등 (프로젝트에 설치된 것 사용)
- 모두 `src/components/layout/`에 배치 (GlobalNav 이미 있으면 그 안에서 정리)
- 작업 순서: GlobalHeader → TabBar → GlobalFooter. 하나씩 만들고 로컬 렌더 확인 후 다음.

## 5. 앨범 등록 요청 (album_requests) 🔒

> 검색 0 빈 상태에서 진입. **유저측만 정식 화면, 승인은 Supabase 콘솔 수동**(관리자 UI 로드맵).

- **요청 폼 (모달/페이지)**: 앨범명(필수) · 가수명 · 출처 URL(선택) + 올리기🔒
- **내 요청 조회**: 프로필 또는 요청 후 상태(pending/approved)
- **관리자 화면**: ❌ 이번 스코프 제외 (콘솔에서 status 수동)

## 6. 공통 인터랙션 규칙

| 규칙 | 내용 |
|---|---|
| 🔒 로그인 게이트 | 참여(작성·좋아요·구독·팔로우·평점·요청) → /login(구글) → 복귀 |
| 좋아요 | 하트 탭 = 토글 (별도 버튼 없음). 앨범 하트 = HOT 투표 |
| 🥶 빈 상태 | 모든 목록 = "당신이 첫 번째" CTA (콜드스타트 대응) |
| 에러 | 사과체 금지. 무엇이·어떻게 명시 ("불러오지 못했어요. 다시 시도") |
| 버튼 라벨 | 행위=결과 일치 ("팔로우"→"팔로잉", "구독"→"구독중") |

## 7. 화면별 상태 (Figma 프레임 세트)

각 핵심 화면 = 4상태 프레임: 기본 / 비로그인🔒 / 빈🥶 / 에러

## 8. 컴포넌트 추가/변경

| 컴포넌트 | 작업 | 용도 |
|---|---|---|
| AlbumCard | 뱃지 오버레이 슬롯 추가 | 커버 우상단 ★평점/♥좋아요 (TOP/HOT) |
| CarouselArrow | 신규 | 원형 ‹ › 캐러셀 이동 버튼 |
| SectionHeader | 신규 | "월간 앨범"·"갤러리 핫글" + 더보기→/토글 (4섹션 반복) |
| GlobalHeader / TabBar / GlobalFooter | 신규 (§4 구현 디테일 참고) | 전 화면 공용 레이아웃 |
| GalleryRow | post_flag 라벨 variant 추가 (notice/concept/normal) | 갤러리 공지·개념 표시 |
| SubscribeButton | 신규 (FollowButton 패턴 재사용) | 갤러리 구독 토글 |
| GalleryCard | 신규 | 전체 갤러리 그리드용 (순위·이름·글수·구독) |
| Input | 신규 | 로그인·검색·폼 입력 필드 |

> 기제작 15개(Button·Avatar·AlbumCard·AlbumGrid·RatingStars·RankCard·FeedItem·GalleryRow·CategoryTab·PromoCard·CommentItem·FollowButton·NotificationItem·HubTabs·TabBar)에 위 신규분 추가. (05 §3의 컴포넌트 인벤토리와 동일 목록 — 최신 상태는 이 표 기준)

## 9. 다음 문서 연결

- **07 API-Spec**: 각 화면 데이터 요구 → 엔드포인트 (작성 완료).
- **개발**: 화면 = 컴포넌트 조립 그대로 구현.

> ⚠️ 위 내용은 2026/08 피벗 시점 기획 원본입니다. 실제 구현 차이는 [docs/technical/album-hub.md](./technical/album-hub.md), [docs/technical/promo-board.md](./technical/promo-board.md) 참고.
