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
- Start date: 이슈 생성 시점엔 잠정값(오늘 날짜)으로 채워두고, 실제 착수일이 확정되면
  5단계에서 재확인·갱신한다 / Target date: 마일스톤 기한 / End date: 이슈 생성 시점엔
  비워두고 5단계(PR 생성)에서 채운다
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
- PR 생성 직후 연결된 이슈의 프로젝트 필드를 실제 값으로 갱신한다 (상세: 이슈 필드 규칙 참고)
  - Start date → 그 작업의 실제 첫 커밋 날짜로 수정
  - End date → PR 생성일로 설정
  - Target date는 마일스톤 기한과 다르면 바로잡는다
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
PowerShell 큰따옴표 개행 방식(`git commit -m "...여러 줄..."`)도 본문 소실
위험이 있어 사용하지 않는다 — 여러 줄 커밋 메시지 작성법은 워크플로우
4단계 참고 (임시 파일 작성 후 `git commit -F`).

### 커밋 메시지 오류 발견 시
이미 push된 커밋의 메시지가 잘못됐으면:
  git commit --amend -m "올바른 메시지"
  git push --force-with-lease
(--force-with-lease만 사용, --force 단독 사용 금지 — 안전장치 유지)

## 📅 이슈 필드 규칙

이슈 생성 시 아래 필드를 모두 지정한다:
- 라벨: bug / regular development / urgent development
- 마일스톤: 주제별 (소셜 / 게시판 / 랭킹·탐색 / 시스템 등, 실제 저장소 마일스톤 기준)
  마일스톤 이름에 Phase가 포함되므로 별도 Phase 필드는 없음
- project : ARS
- Start date: 실제 개발 착수일 (= 그 작업의 코드를 처음 만든 날짜. 브랜치 생성일이나
  이슈 생성일이 아니라 첫 커밋 날짜 기준. 이슈 생성 시점엔 잠정값을 넣고,
  실제 착수일이 확정되면 갱신한다)
- Target date: 해당 이슈가 속한 마일스톤의 기한으로 고정 (마일스톤이 바뀌면 함께 갱신)
- End date: PR 생성일로 고정 (머지일이 아님 — PR 생성 시점 기준. 이슈 생성 시점엔
  비워두고 5단계에서 채운다)

이슈 생성 시점의 값은 잠정치일 수 있으므로, 5단계(PR 생성) 직후 Start date/End date가
실제 값과 맞는지 반드시 재확인·갱신한다. Target date는 마일스톤 기한과 항상 일치해야 하며
불일치 시 그 자리에서 바로잡는다.

### gh CLI로 프로젝트 필드 갱신하는 법
```
gh project item-list 6 --owner Zpark99 --format json   # ITEM_ID 조회 (이슈 번호로 필터)
gh project item-edit --id <ITEM_ID> --project-id <PROJECT_ID> --field-id <FIELD_ID> --date "YYYY-MM-DD"
```
ARS 프로젝트(project 6)의 고정 ID (재조회 불필요):
- project-id: `PVT_kwHOCiWYls4BZemI`
- Start date field-id: `PVTF_lAHOCiWYls4BZemIzhUc95U`
- Target date field-id: `PVTF_lAHOCiWYls4BZemIzhUc95Y`
- End Date field-id: `PVTF_lAHOCiWYls4BZemIzhUuYDY`
