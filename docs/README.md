# docs/ 목차 — ARS (피벗)

> 면접관·처음 보는 분을 위한 읽기 순서. **5분이면** 루트 [README](../README.md) → 최종 회고 → ERD 순서를 권합니다.
> "기획" 표시가 있는 문서는 2026-08 피벗 시점 기획본이라 실제 구현과 차이가 있고, 각 문서 상단/하단에 델타 안내가 있습니다. 실제 상태의 정본은 **ERD·배포 체크리스트·코드**입니다.

## 기획 (2026-08, 피벗 시점)

| 문서 | 역할 |
|---|---|
| [00_Pivot-Decision-Log](./00_Pivot-Decision-Log.md) | 왜 피벗했나, v1 기능 승계/폐기 판단표, DB 델타 개요 |
| [01_PRD](./01_PRD.md) | 요구사항 정의 — 목표·페르소나·기능 범위·비기능 요구 |
| [02_IA-Sitemap](./02_IA-Sitemap.md) | 라우트 구조·네비게이션·게이트(로그인 유도) 정책 |

## 설계

| 문서 | 역할 |
|---|---|
| [03_ERD](./03_ERD.md) | **실제 배포 스키마**(v1.0.5) — 테이블·RLS·트리거·기획 대비 델타·v1.1 로드맵. 정본 |
| [05_Design-System](./05_Design-System.md) | 디자인 토큰(Brand→Semantic)·타이포·컴포넌트 목록 (기획) |
| [06_Screen-Definitions](./06_Screen-Definitions.md) | 화면정의서 — 화면별 구성·상태·컴포넌트 변경 이력 (기획, v0.3) |

## 운영

| 문서 | 역할 |
|---|---|
| [08_Deployment-Checklist](./08_Deployment-Checklist.md) | 배포 전 점검표(v0.5) — 환경변수·RLS·트리거·스모크 항목 |
| [루트 CLAUDE.md](../CLAUDE.md) | 브랜치 3단계·이슈→PR→승격 워크플로우·더미 데이터 금지 규칙 (AI 협업 규칙서) |

## 회고

| 문서 | 기간 |
|---|---|
| [최종 회고 — 피벗 총정리](./retro/2026-pivot-final.md) | 2026-08-04 ~ 10-20 (+10/25 v1.0 이력). 타임라인·숫자·핵심 결정·반복된 문제 |
| [W35](./retro/2026-W35.md) | 08/23–08/29 화면 재설계·더미 조립 |
| [W36](./retro/2026-W36.md) | 08/31–09/06 실데이터 연결, 더미 식별자 3차 재발 → 가드 |
| [W37](./retro/2026-W37.md) | 09/07–09/13 첫 프로덕션 승격, 문서 레포 이관 |
| [W39](./retro/2026-W39.md) | 09/19–09/26 갤러리 댓글·좋아요, P3 마감 (W38은 커밋 0건으로 흡수) |
| [W40](./retro/2026-W40.md) | 09/26–10/02 거짓 UI 정직화, 2차 승격 |
| [W41](./retro/2026-W41.md) | 10/02–10/09 관리자 role(RLS 교체), 승격=merge commit 결정 |
| [W42](./retro/2026-W42.md) | 10/10–10/17 E2E 도입, [마감-1] 021 트리거·글 수정/삭제 |

## 기술 노트 (구조·근거)

| 문서 | 역할 |
|---|---|
| [technical/album-hub](./technical/album-hub.md) | 앨범 허브 4탭 구조와 쿼리 근거 |
| [technical/promo-board](./technical/promo-board.md) | 홍보게시판 스키마·정책 근거 (014~016) |
| [technical/design-system-tokens](./technical/design-system-tokens.md) | 디자인 토큰 코드화 구조 |

## 아카이브 (기획본·구버전 — 현재와 다름)

| 문서 | 역할 |
|---|---|
| [archive/04_System-Architecture.planning](./archive/04_System-Architecture.planning.md) | 아키텍처 기획본 — Spotify 계획 등 실제와 다름, 상단 배너 참고 |
| [archive/07_API-Spec.planning](./archive/07_API-Spec.planning.md) | API 명세 기획본 — 실제 API는 `src/app/api/` 코드가 정본 |
| [archive/README.v1](./archive/README.v1.md) | 피벗 전(v1) README 원본 |

`images/`는 루트 README 스크린샷(홈 1440·375, 앨범 허브 1440, 2026-10-24 프로덕션 촬영).
