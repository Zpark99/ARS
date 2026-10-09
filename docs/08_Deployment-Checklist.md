# Deployment-Checklist — ARS (피벗)

> ✅ 배포 전 점검 · 🛡️ 보안 · ♻️ v1 잔여 이슈 회귀
> 선행: [docs/archive/04_System-Architecture.planning.md](./archive/04_System-Architecture.planning.md) · [docs/archive/07_API-Spec.planning.md](./archive/07_API-Spec.planning.md)

## 0. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.1 (배포) |
| 작성일 | 2026/08/12 |
| 작성자 | 박진재 |
| 대상 | Vercel (main = production) |

**변경 이력**

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v0.0(초안) | 08/12 | 최초 작성 |
| v0.1(배포) | 09/09 | 갤러리 팀별 전환(galleries 폐기→artists 흡수), posts.gallery_id→artist_id, post_flag(notice/concept/normal) 추가, gallery_subscriptions 신규, 로그인 구글 OAuth 확정 |
| v0.2 | 09/26 | 갤러리 댓글·좋아요(017/018) 점검·스모크 항목 추가, 홈 상세 링크(#146) 스모크 추가, v1.1 목록 추적 번호 갱신, 머지 규칙 문구를 CLAUDE.md(질문→승인)와 일치 (#157) |
| v0.3 | 10/09 | §2에 관리자 전용 RLS(019/020 — updates 쓰기·notice 지정 제한 + UPDATE WITH CHECK) 점검 항목 추가, "role 체계 v1.1" → **일부 구현(is_admin 도입)**으로 정정, §5에 관리자 권한 스모크 추가 (#125, PR #164 머지 전) |
| v0.4 | 10/09 | #125 반영 완료로 상태 문구 정정(#167 승격·이슈 종료), §5 관리자 스모크를 갤러리 탭별 글쓰기 규칙으로 갱신(#172) |

## 1. 환경변수 🛡️

| 변수 | 위치 | 노출 |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | 클라 | 공개 OK |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | 클라 | 공개 OK (RLS 전제) |
| SUPABASE_SERVICE_ROLE_KEY | **서버만** | ⛔ 절대 클라 금지 |

> 앨범 데이터 소스 = **MusicBrainz**(공개 API, 키 불필요) + Cover Art Archive. Spotify는 미구현 → 관련 환경변수 없음. (v1.1에서 데이터 소스 검토 시 재논의)

- [ ] Vercel 프로젝트에 위 변수 전부 등록
- [ ] `NEXT_PUBLIC_` 없는 키(SERVICE_ROLE)가 클라 번들에 안 섞였는지 확인
- [ ] `.env.local` 커밋 안 됨 (.gitignore `.env*` 확인)
- [ ] MusicBrainz User-Agent 헤더 정상(요청 시 식별자 포함)

## 2. DB · RLS 🛡️

실제 테이블: profiles · artists · albums · gallery_posts · board_posts(promo/qa/update) · comments · likes · follows · ratings

- [ ] 전 테이블 RLS **활성화**
- [ ] 열람 개방 테이블 anon SELECT 정책 확인
- [ ] 쓰기 정책 `auth.uid() = user_id` 검증 (board_posts / gallery_posts / comments / likes / ratings)
- [ ] board_posts CHECK 완화 반영 확인 (#116): `artist_id IS NOT NULL OR artist_name_text IS NOT NULL`, album_id nullable
- [ ] board_posts 부분 인덱스 확인 (#100): `idx_board_posts_promo_album`
- [ ] comments/likes `target_type` CHECK에 `gallery_post` 반영 + `gallery_posts.like_count` 컬럼·`sync_like_count()` 갤러리 분기 확인 (017/018, #147/#150)
- [ ] **관리자 전용 쓰기 정책 확인** (019/020, #125): `profiles.is_admin` 컬럼 · `public.is_admin()`(SECURITY DEFINER·STABLE·`search_path=public`, `anon`엔 EXECUTE 없음) · `board_posts` INSERT/UPDATE에 `board_type='updates'` 제한 · `gallery_posts` INSERT/UPDATE에 `post_flag='notice'` 제한
- [ ] **UPDATE 정책에 `WITH CHECK` 존재 확인** — `USING`만 있으면 본인 행의 `board_type`/`post_flag` 바꿔치기가 뚫림(020에서 실제로 막은 구멍). 권한 변경 후엔 차단 확인만이 아니라 **일반 유저 회귀**(과차단 여부)까지
- [ ] 마이그레이션 파일 = DB 상태 일치 (유령 마이그레이션 없음, 파일 먼저 원칙)

> ✅ **일부 구현**: 관리자 전용(`is_admin`) 정책 — 019/020으로 `profiles.is_admin` + `public.is_admin()` + updates 쓰기·notice 지정 제한이 **라이브 DB에 적용됨**(#125). UI 게이트도 프로덕션 반영(#167). 갤러리 공지 작성은 공지 탭 관리자 전용(#172).
> ⏸ v1.1 잔여: 앨범 보정(`artists`/`albums`) 관리자 쓰기, 앨범 등록요청 승인(`album_requests` 테이블 자체 없음 → #156), `board_type` 전면 불변(#43 — 020은 updates 전환만 차단).
> ⏸ v1.1: notifications 테이블 — 알림 실기능 미구현(현재 스텁).

## 3. 데이터 구조 확인 (피벗 반영)

> ※ 초안의 "v1 board→posts 백필 / 8/17 컷라인"은 지난 결정 — 피벗으로 아래 구조 확정됨.

- [ ] board_posts board_type 매핑 정확성 (promo / qa / update)
- [ ] gallery_posts: album_id 없음, artists.name = albums.artist_name 조인으로 artist_id 재사용(#100)
- [ ] 홍보 아티스트 표시 분기 정상: artist_id 있으면 artists(name) 조인 / 없으면 artist_name_text (#116)

## 4. v1 잔여 이슈 회귀 테스트 ♻️

- [ ] **더미 라우팅 식별자 가드** (#49/#96/#108 3회 재발 → #109/#112): 가짜 mbid/id로 접근 시 DB 도달 전 notFound + 로그. `/album/mbid-1` 등으로 실제 확인
- [ ] **FK embed null** (#106): to-one embed를 배열로 오추론 → 조용히 null. 홍보 카드/상세에서 아티스트 이름(선택형=조인, 수기형=텍스트) 정상 표시 확인
- [ ] **커버 하이드레이션 유실** (#62/#113): SSR 전 onError 유실 → 커버 없는 앨범에서 placeholder 정상
- [ ] **에러 스왈로잉** (#105/#106): supabase는 throw 안 함 — error 안 꺼내면 실패가 0건으로 둔갑. 목록/INSERT 실패가 성공·빈상태로 삼켜지지 않는지
- [ ] **likes 동시성**: 빠른 연속 좋아요·언라이크 → 카운트 정확, 중복 없음
- [ ] ⏸ **1000행 키셋 커서** — 페이지네이션 미구현(v1.1, #155). 현재 목록 limit 명시로 silent 절단만 방지 확인
- [ ] **auth 401/500**: 미인증 → 로그인 유도, 네트워크 오류와 혼동 없음

## 5. 기능 스모크 테스트 (프로덕션 URL에서)

- [ ] 홈: TOP/HOT 렌더 · 실시간 피드 이동 · 카드 → 앨범 허브 도달 · 빈 상태 · 갤러리 HOT/홍보/피드 갤러리 이벤트 → 글 상세 도달 (#146)
- [ ] 아카이브: 전체 목록 렌더 · 카드 클릭 → 앨범 허브 도달 (장르/연도 필터 없음 = 정상, v1.1)
- [ ] 앨범 허브: 탭(홍보/갤러리/반응/정보) 전환 · 좋아요=HOT 반영 · 정보탭 평점
- [ ] 글쓰기: 홍보(선택형/수기형) · 갤러리 작성 → INSERT 반영 · 로그인 게이트 (#116)
- [ ] 글 읽기: 갤러리·홍보·QA·업데이트 목록 → 글 클릭 → 상세 본문 도달 · href="#" 잔존 0 (#121)
- [ ] 글 반응: 갤러리·홍보·QA 상세에서 댓글 작성/본인 삭제 · 글/댓글 좋아요 토글 → 카운트 반영 · 공유 버튼 노출 (#149)
- [ ] 프로필: 마이페이지 → 프로필 흡수 · 팔로우/팔로잉 · isOwn 분기(이메일 본인만)
- [ ] 알림: 아이콘 클릭 → 404 아닌 빈 상태 스텁 (실기능 v1.1)
- [ ] 관리자 권한 (#125/#172): 일반 계정 → `/updates` 글쓰기 버튼 없음 · 갤러리 **공지·개념글 탭에 글쓰기 버튼·빈 상태 CTA 없음**(전체 탭만 글쓰기) / 관리자 계정(`profiles.is_admin=true`) → `/updates` 글쓰기 노출 · 갤러리 **공지 탭에서 글쓰기 → 공지로 등록**(토글 없음, 탭이 종류 결정 — #172) · 개념글 탭은 관리자도 버튼 없음. DB 레벨 차단은 §2에서 확인. 비관리자 쪽은 E2E(`npm run test:e2e`)가 자동 확인
- [ ] 반응형 767 분기 · 하단 TabBar(모바일)

> ⏸ v1.1: Spotify는 **커버·메타 보강 레이어로만** 재도입 검토(교체 아님, 링크백·로고 출처 표시 선행 — #151 결론 2026-10-08) / 앨범 등록요청 저장(#156, 현재 모달은 "준비 중" 표시) · 요청 승인 관리자 화면 / 갤러리 글 수정·삭제(#64, 삭제는 #148 선행)
> ✅ 공지·업데이트 쓰기 권한(#125): DB 차단 + UI 게이트 프로덕션 반영(#167). ⏸ `concept` 직접 작성 차단은 #126 결정 후

## 6. 배포 절차

- [ ] develop 안정화 확인
- [ ] **develop 머지분의 열린 이슈 수동 정리** — develop 머지는 `Closes` 자동 발동 안 됨(기본 브랜치=main일 때만). main 승격 전 미정리 이슈 확인
- [ ] develop → main 승격 PR (= 프로덕션 배포, 머지 시 `Closes` 자동 발동)
- [ ] Vercel 빌드 성공 · 환경변수 반영 확인
- [ ] 프로덕션 URL 스모크 (§5 핵심 경로)
- [ ] CLAUDE.md 워크플로우 준수 (기능→develop→main, 머지는 질문→명시적 승인 시에만 · develop→main은 매번 별도 확인)

## 7. 배포 후

- [ ] 콜드스타트 대응: 시드 앨범·본인 홍보글 등록
- [ ] 에러 로그 모니터링 (첫 24h) — 특히 §4 회귀 지점(더미 식별자 가드 로그, INSERT error)
- [ ] v1.1 마일스톤 정리: 알림 실기능(#128), 페이지네이션(#155), 앨범 등록 요청 저장(#156), 게시판 안내 기능(#152), 갤러리 이미지 업로드(#124), 개념글 정렬(#126), 매칭 갭(#101), 갤러리 삭제 정리 트리거(#148), `board_type` 불변(#43)
  - ✅ 공지 권한·role 체계(#125): **완료** — 019/020 적용, UI 프로덕션 반영(#167), 프로덕션 관리자 UI 확인 후 종료(10/09)
  - ✅ 데이터 소스 검토(#151): 조사 **완료**(2026-10-08) — MusicBrainz 유지 + Spotify 보강, ip3-archive 탈락. 실구현은 v1.1
