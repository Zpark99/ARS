# ARS (Album Review Service)

> 리스너는 즐길 수 있고, 아티스트는 홍보를 할 수 있는 음악 커뮤니티

**🔗 Live: https://ars-eta-one.vercel.app**

---

## 스크린샷

> *(홈 화면 스크린샷/GIF)*

> *(앨범 허브 화면 스크린샷/GIF)*

## 이런 서비스입니다

MusicBrainz에서 앨범을 검색해 아카이브에 모으고, 앨범마다 "허브" 페이지를 두어 그 앨범에 달린 홍보글·갤러리·반응·정보를 한곳에서 볼 수 있게 했습니다. 원래는 평점·코멘트 중심의 앨범 평가 앱으로 시작했지만, 평점을 정보 탭 하나로 내리고(#71) 앨범을 매개로 한 게시판·팔로우 중심 커뮤니티로 방향을 바꿨습니다.

## 핵심 기능

- **앨범 아카이브** — MusicBrainz API로 앨범 검색, 아카이브 목록/필터(아티스트·평점·정렬)
- **앨범 허브** — 앨범별 홍보/갤러리/반응/정보 4개 탭(`HubTabs`)
- **커뮤니티 게시판** — 홍보·갤러리·QA·업데이트 4종 게시판 글쓰기/열람, 댓글·좋아요
- **소셜** — 공개 프로필, 팔로우/언팔로우, 좋아요(앨범/댓글/게시글 공통)
- **랭킹** — 홈 화면 HOT 앨범에만 적용(앨범 좋아요 순)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React 19 |
| Backend/DB | Supabase (PostgreSQL, RLS, Auth) |
| 외부 API | MusicBrainz, Cover Art Archive |
| 테스트 | Vitest |
| 배포 | Vercel |

## 한번 막힌 지점

### 1. 더미 라우팅 식별자 감별

레이아웃 단계에서 넣은 더미 라우팅 식별자(`mbid-1` 류)가 실제 클릭 시 404로 이어지는 문제가 세 번 재발했습니다(#49 → #96 → #108). 세 번째 재발 후에는 개별 수정 대신, 동적 라우트에서 UUID/mbid 형식이 아니면 DB 조회 전에 걸러내는 가드를 넣고 CLAUDE.md에 "라우팅에 쓰이는 식별자는 더미여도 가짜 값 금지" 규칙으로 못박았습니다(#109/#112).

### 2. 타입이 맞다고 해도 런타임을 의심함

- Supabase 쿼리는 실패해도 throw하지 않고 `{ data, error }`를 반환합니다. `error`를 확인하지 않으면 조회 실패와 "결과 0건"이 구분되지 않아, 화면엔 그냥 빈 목록으로 보였습니다(#105/#106에서 `error` 필드 명시 체크로 수정).
- `artists(name)` 같은 to-one FK embed를 supabase-js 기본 타입 추론이 배열로 잡는데, 실제 REST 응답은 단일 객체였습니다. 타입만 믿었으면 팀 이름이 항상 `null`로 나오는 조용한 버그가 났을 자리라 curl로 실제 응답을 직접 확인하고 타입을 맞췄습니다(#103).

### 3. 단순 평가 -> 커뮤니티로 피벗

초기엔 평점(0.5 단위)·코멘트가 핵심이었지만, 앨범을 중심으로 활동이 모이는 아카이브/커뮤니티 쪽이 더 맞다고 판단해 평점을 앨범 상세의 정보 탭 하나로 내리고 마이페이지를 프로필로 흡수했습니다(#71).

## 로컬 실행

```bash
git clone https://github.com/Zpark99/ARS.git
cd ARS-web
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

## 프로젝트 구조

```
src/
├─ app/                # 라우트 (App Router)
│  ├─ album/[mbid]/     # 앨범 허브
│  ├─ archive/          # 아카이브
│  ├─ gallery/, promo/, qa/, updates/   # 게시판 4종
│  ├─ profile/[id]/, ranking/, search/
│  └─ api/              # search, likes, follows, ratings, comments
├─ components/          # album, board, gallery, promo, profile, ranking, ui 등
├─ lib/
│  ├─ supabase/         # client.ts, server.ts
│  ├─ likes/, validation/
└─ hooks/, types/
supabase/migrations/     # 스키마 변경 이력 (DB 직접 수정 금지, 파일로만)
```

## 로드맵 (v1.1)

아직 스키마나 실기능이 없어 의도적으로 보류한 항목입니다.

단순기능
- 알림 실기능 (발생/목록/읽음 처리) — #128
- 목록 페이지네이션(키셋 커서) — 현재 "더 보기"는 비활성 플레이스홀더 — #155
- 도메인 구매

아카이브 
- API 수정 -> 장르, 연도별 앨범 구분 — #130
- 앨범 등록 요청 저장 연결(현재 모달은 저장 없이 접수 표시만) — #156

게시판
- 게시판 공지·관리자 권한(role 체계) — #125
- 갤러리 이미지 업로드(Storage 연동) — #124
- 게시판 글 C완성 -> RUD 완성(앨범 홍보글 양식 참고)
- API 데이터 수정(MusicBrainz는 들어오는 유저의 정서와 다소 떨어짐) — #151
- `albums.artist_name` ↔ `artists` 자동 동기화 (현재 매칭 갭 22%) — #101
- 게시판 안내 기능 살리기(신고, 공지사항, 신설 갤러리 요청, 자주 묻는 질문, 이용 규칙) — #152

그 외 
- 남은 이슈들 처리, 혹은 필요 없을 시 삭제