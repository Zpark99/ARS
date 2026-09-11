# Design-System — ARS (피벗)

> ✅ 확정 · 🔶 판단 · 🟢 v1 승계 · 🆕 피벗 신규
> 선행: [01 PRD](./01_PRD.md) §7 · 병행: [06 Screen-Definitions](./06_Screen-Definitions.md) · 대상: Figma

## 0. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.2 (기획-디자인 완료) |
| 작성일 | 2026/08/22 |
| 작성자 | 박진재 |
| 기준 | v1 Brand 색 승계 + 타이포·시맨틱 신규 정의 |
| 폰트 | Pretendard (Figma·코드 공통) |
| 모드 | 다크 단일 (라이트 토글 P2 이후) |

**변경 이력**

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v0.0 | 08/12 | 초안 (v1 승계 가정) |
| v0.1 | 08/20 | 타이포 5단 신규 정의(v1 승계 아님), Semantic 색 확정, 컴포넌트 15개 실제작 반영, 신규 컴포넌트 추가 |
| v0.2 | 08/22 | 문서 내용 수정 |

## 1. 원칙

Figma에서 토큰·컴포넌트를 **직접 제작**. v1에서 가져온 건 **Brand 색 7종뿐**이고, 타이포·시맨틱 색·컴포넌트는 이번에 신규 정의했다.

- **Brand 색**: v1 승계 (라임 accent 유지)
- **타이포·시맨틱 색**: 🆕 신규 정의 (v1엔 없었음)
- **차별화 축**: 팔레트가 아니라 **커뮤니티 구조·레이아웃**(익카이브식 홈 · 디시식 갤러리)

## 2. 토큰 (Design Tokens)

### 2.1 Color/Brand 🟢 승계 (v1 7종)

| 토큰 | 값 | 용도 |
|---|---|---|
| bg | #050505 | 페이지 배경 |
| surface | #100F12 | 카드·패널 |
| border | #1F1F22 | 구분선·테두리 |
| text | #EDEDED | 본문 |
| text-muted | #9A9AA0 | 보조·메타 |
| accent | #A3E635 | 강조·CTA |
| accent-foreground | #050505 | accent 위 텍스트 |

### 2.2 Color/Semantic 🆕 확정 (4종)

| 토큰 | 값 | 용도 |
|---|---|---|
| hot | = accent alias | HOT 랭킹·인기 뱃지 (accent 참조 → 캐스케이드) |
| surface-raised | #16151A | 피드·홍보 카드·알림 (surface보다 한 단계 위) |
| success | #4ADE80 | 팔로우 완료·저장 성공 |
| danger | #F87171 | 삭제·에러·언팔로우 경고 |

> hot은 Brand accent를 **참조하는 alias** (값 복붙 아님). surface-raised·success·danger는 독립 값. 전부 다크 배경 검증 완료.

### 2.3 Radius 🟢 승계

sm 6 · md 10 · lg 14 · full 9999

### 2.4 Spacing 🟢 승계

4 · 8 · 12 · 16 · 24 · 32 (+ Figma에 7단 등록)

### 2.5 Typography 🆕 신규 정의 (Pretendard, 5단)

> ⚠️ v1엔 타이포 스타일 없었음. 이번에 신규 정의 (기존 "v1 승계" 기록은 오기).

| 스타일 | size / line-height | weight | 용도 |
|---|---|---|---|
| display | 28 / 36 | Bold(700) | 홈 히어로·페이지 타이틀 |
| title | 20 / 28 | SemiBold(600) | 앨범 허브 헤더·섹션 제목 |
| subtitle | 16 / 24 | SemiBold(600) | 카드 제목·글 제목 |
| body | 14 / 22 | Regular(400) | 본문·댓글 |
| caption | 12 / 16 | Regular(400) | 메타(작성자·시간·반응수) |

## 3. 컴포넌트 인벤토리 (Figma 제작 완료)

### 3.1 🟢 승계

| 컴포넌트 | 상태 variant |
|---|---|
| Button | primary/ghost × default/hover/pressed/disabled |
| Avatar | sm/md/lg × image/fallback |

### 3.2 🟡 변형

| 컴포넌트 | v1 → 피벗 |
|---|---|
| AlbumCard | 평가카드 → grid(아카이브) / header(앨범 허브). 뱃지 오버레이 추가 |
| AlbumGrid | AlbumCard(grid) 반복 (별도 컴포넌트 X) |
| RatingStars | 홈 핵심 → 앨범 정보 탭 강등. display/input |

### 3.3 🆕 신규 (제작 완료)

| 컴포넌트 | 화면 | variant |
|---|---|---|
| RankCard | (랭킹 전용 페이지용, 홈 폐기) | top/hot |
| FeedItem | 홈 피드 | — |
| GalleryRow | 갤러리 목록 | default/visited + notice/concept/normal |
| CategoryTab | 갤러리·토글 | selected/default |
| PromoCard | 홍보게시판 | — |
| CommentItem | 전 게시판 | — |
| FollowButton | 프로필·홍보글 | follow/following |
| NotificationItem | 알림 | unread/read |
| HubTabs | 앨범 허브 | promo/gallery/reactions/info |
| TabBar | 전역(모바일) | — |

### 3.4 🆕 추가 예정 (홈 재정비·갤러리 전환)

> SectionHeader·CarouselArrow·GlobalHeader/TabBar/GlobalFooter·SubscribeButton·GalleryCard·Input의 최신 작업 내역·용도는 [06 Screen-Definitions §8](./06_Screen-Definitions.md#8-컴포넌트-추가변경)로 통합됨 (중복 제거). GlobalHeader/TabBar/GlobalFooter의 구현 디테일은 [06 §4](./06_Screen-Definitions.md#4-공용-레이아웃-전-화면-공통) 참고.

| 컴포넌트 | 용도 |
|---|---|
| Composer | 댓글 입력 (CommentItem 세트) |

## 4. Figma 구조 (Variables vs Pages)

- **Variables (토큰 엔진)**: Brand(ARS) → Semantic(alias) → 컴포넌트 참조. 값 바꾸면 캐스케이드.
- **Pages (비주얼 카탈로그)**: 01 색 · 02 타이포 · 03 컴포넌트 · 04 화면정의서.
- **Text styles**: 타이포 5단은 Variables가 아니라 **Text styles**로 등록 (여러 속성 묶음).
- **작업 방식**: 컴포넌트 15개를 Figma에서 직접 제작 (variant 결합·토큰 연결). 픽셀 완벽 재현보다 구조·토큰 일관성 우선.

## 5. 반응형

- **분기: 767px** (PRD §7)
- 웹(≥768): 홈 = 4섹션 콘텐츠 허브(컨테이너 1364), 헤더 풀 내비
- 모바일(<768): 홈 = 단일 컬럼 세로 스택, 상단 축약 헤더 + 하단 TabBar. 캐러셀 → 가로 스와이프, 그리드 열 축소

## 6. 다음 문서 연결

- **06 Screen-Definitions**: 컴포넌트 → 화면 배치·상태.
- **개발**: globals.css 토큰(Brand·Semantic) · tailwind.config(색·radius·spacing·타이포 5단) · 컴포넌트 파일.

> ⚠️ 위 내용은 2026/08 피벗 시점 기획 원본입니다. 실제 토큰 코드화 결과는 [docs/technical/design-system-tokens.md](./technical/design-system-tokens.md) 참고.
