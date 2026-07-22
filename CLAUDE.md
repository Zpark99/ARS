# ARS (Album Review Service) — 개발 규칙

## 기술 스택

- **프레임워크**: Next.js (App Router) + TypeScript
- **스타일링**: Tailwind CSS
- **백엔드 / DB / 인증**: Supabase

## 디자인 원칙

- **모바일 우선(mobile-first)**: 기본 스타일은 모바일 기준으로 작성
- 반응형 레이아웃은 Tailwind의 `md:` / `lg:` 접두어로만 처리

## 디렉토리 규칙

- Supabase 클라이언트: `src/lib/supabase/`
- 컴포넌트: `src/components/`

## 보안
 b않는다 (`.gitignore`에서 `.env*` 전체 무시 중)

## 📋 이슈 → 작업 → 머지 워크플로우 (필수 루틴)

모든 기능/수정 작업은 아래 순서를 따른다. Claude가 이슈 생성부터 PR 생성까지
직접 실행하며, 머지만 사용자가 수동으로 한다.

### 1단계 — 이슈 생성 (작업 시작 시)
gh CLI로 이슈를 먼저 만든다.
- 제목: `<type>: 작업 요약`
- 본문: 작업 내용 + 완료 조건(DoD)을 체크리스트(- [ ])로
- 라벨: bug / regular development / urgent development 중 해당하는 것
- 마일스톤: 해당 마일스톤에 연결 (예: 소셜 레이어 - P2 (게시판), 안정화·배포 - P3)
  마일스톤 이름이 Phase를 포함하므로 별도 Phase 필드는 없음
- Start date: 개발 착수일 / Target date: 마일스톤 기한 / End date: PR 생성일
- assignee: @me
- 생성 후 이슈 번호를 사용자에게 알린다.

### 2단계 — 브랜치 생성
- git checkout main && git pull origin main (최신화 먼저)
- git checkout -b <type>/<간단한-설명> (예: feature/archive-filter, fix/logout-refresh)
- 브랜치명에 `#`나 공백 금지. type은 feature/fix/refactor/chore/docs.

### 3단계 — 작업 진행
- 코드/마이그레이션 작업 수행.
- 마이그레이션은 반드시 "파일 먼저 작성(supabase/migrations/) → 커밋 → DB 적용" 순서.
  DB에 직접 SQL 실행 후 파일 누락 금지 (유령 마이그레이션 재발 방지).
- 파괴적 스키마 변경(컬럼 삭제/타입 변경)은 마이그레이션과 코드 수정을
  같은 브랜치에서 함께 완료하고 로컬 검증 후 커밋한다.
- 기능 = 명세 + 코드 + 테스트 세트로 진행.

### 4단계 — 커밋 (Claude가 직접 실행)
1. git status / git diff --stat 로 변경 확인
2. .env.local 등 비밀 파일이 안 잡혔는지 반드시 확인
3. 여러 줄 커밋 메시지는 임시 파일에 작성 후 -F로 읽는다
   (PowerShell 개행 방식은 본문 소실 위험이 있어 사용 금지):
   - 메시지를 scratchpad/commit_msg.txt 등에 작성
   - git add . && git commit -F "메시지파일경로"
4. 커밋 메시지 형식: "<type>: <한 줄 요약> (#이슈번호)" + 본문
   - 이슈를 완전히 끝내면 본문에 "Closes #N" 추가
5. git push -u origin <브랜치명>

### 5단계 — PR 생성 (Claude가 직접 실행)
- gh pr create --base main --title "..." --body "... Closes #이슈번호"
- PR 생성까지 완료한 뒤 사용자에게 PR 링크와 함께 알린다.
- 여기서 멈춘다. ⛔ 머지는 하지 않는다.

### 6단계 — 머지 (⛔ 무조건 사용자 수동. Claude 자동 머지 절대 금지)
- Claude는 어떤 경우에도 머지하지 않는다. gh pr merge 실행 금지.
- 사용자가 GitHub에서 PR "Files changed"를 직접 검토하고 머지한다.
- 사용자가 "머지 완료"라고 알리기 전까지 다음 단계로 넘어가지 않는다.

### 7단계 — 머지 후 로컬 정리 (사용자 "머지 완료" 확인 후)
- git checkout main && git pull origin main
- git branch -d <작업브랜치>

### 커밋 메시지 정확성 원칙
- "확인 완료", "정상 동작"이라고 쓰려면 실제 검증한 케이스를 명시한다.
- 검증하지 않은 케이스를 검증했다고 단정하지 않는다.
- 알려진 제한사항은 커밋 메시지에 숨기지 않고 명시한다.

### 실행 범위 요약
- Claude 직접 실행: 이슈 생성 / 브랜치 / 커밋 / push / PR 생성 / 머지 후 정리
- 사용자 수동 전용: 머지 (Files changed 검토 후)

## 🖥️ 커밋 메시지 작성 규칙 (Windows/PowerShell 환경)

이 프로젝트는 Windows PowerShell 터미널을 사용한다. Bash 전용 문법
($(cat <<'EOF' ... EOF) 등 heredoc)은 PowerShell에서 깨지므로 사용 금지.

### 여러 줄 커밋 메시지 작성법
PowerShell은 큰따옴표 안에 줄바꿈을 그대로 넣으면 여러 줄로 인식한다.
별도 특수 문법 없이 아래처럼 작성:

git commit -m "feat: 한 줄 요약 (#이슈번호)

- 변경 내용 1
- 변경 내용 2

Closes #이슈번호"

이 형태를 그대로 커밋 명령어로 제시할 것 (heredoc, cat, EOF 문법 금지).

### 커밋 메시지 정확성 원칙
- "확인 완료", "정상 동작"이라고 쓰려면 실제 검증한 케이스를 명시한다
  (예: "단일 유저 케이스 검증 완료" vs 막연한 "확인 완료").
- 검증하지 않은 케이스를 검증했다고 단정하지 않는다.
- 알려진 제한사항이 있으면 커밋 메시지에 숨기지 않고 명시한다.

### 커밋 메시지 오류 발견 시
이미 push된 커밋의 메시지가 잘못됐으면:
  git commit --amend -m "올바른 메시지"
  git push --force-with-lease
(--force-with-lease만 사용, --force 단독 사용 금지 — 안전장치 유지)

## 📅 이슈 필드 규칙

이슈 생성 시 아래 필드를 모두 지정한다:
- 라벨: bug / regular development / urgent development
- 마일스톤: 주제별 (소셜 / 게시판 / 랭킹·탐색 / 시스템 등, 실제 저장소 마일스톤 기준)
- project : ARS 
- Phase: 프로젝트 보드의 Phase 필드 (Phase 1/2/3 등)
- Start date: 실제 개발 착수일
- Target date: 해당 이슈가 속한 마일스톤의 기한으로 고정
- End date: PR 생성일 (머지일이 아님 — PR 생성 시점 기준)
