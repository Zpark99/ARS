# CLAUDE.md — ARS (피벗)

> 클로드 코드 작업 규칙서. 모든 기능/수정 작업은 이 워크플로우를 따른다. 임의로 건너뛰지 않는다.
> 

──────────────────────────────────────────

## 🌳 브랜치 전략 (3단계)

```
기능 브랜치 (feat/fix/...)  →  develop  →  main(프로덕션)
```

- **기능 브랜치**: 개별 작업 단위. `develop`에서 분기.
- **develop**: 통합·안정화 브랜치. 기능들이 먼저 모이는 곳.
- **main**: 프로덕션. Vercel 배포와 연결(ars-eta-one.vercel.app). 항상 배포 가능 상태.

**분기 기준**

- 기능 브랜치는 항상 `develop`에서 딴다 (`main` 아님).
- `main`에는 오직 `develop`을 통해서만 들어간다. 기능 브랜치 → main 직접 금지.

──────────────────────────────────────────

## 🔑 머지 규칙 (질문 → 승인 시 실행)

> 브랜치 구조·머지 방식 모두 법과사전식을 따른다. **머지 전 항상 질문하고, 명시적 승인이 있을 때만 Claude가 머지한다.**
> 
- **머지 전 항상 질문한다.** PR 생성 후 사용자에게 머지 여부를 물어본다.
- **명시적 승인("OK/머지해" 등)이 있을 때만 Claude가 머지한다.** 분명한 답이 없으면 머지하지 않는다.
- **무응답·모호한 답 = 머지 안 함.** 애매하면 멈추고 다시 확인.
- **develop → main은 매번 별도 확인.** 프로덕션 배포라 5단계 승인으로 대신하지 않는다.
- 이슈 없이 작업 시작 금지. 브랜치 없이 직접 작업 금지.

> 취지: "무조건 사람이 머지"는 시간 없을 때 비효율적이었다. 그래서 **질문 → 승인 시 진행**으로 바꿨다. 단, 판단 지점(머지할지)은 항상 사람이 쥔다.
> 

──────────────────────────────────────────

## 📋 이슈 → 작업 → 머지 워크플로우 (필수 루틴)

### 1단계 — 이슈 생성 (작업 시작 시)

gh CLI로 이슈를 먼저 만든다.

- 제목: `[Pn] 작업 요약` (Pn = 해당 Phase)
- 본문: 작업 내용 + DoD를 체크리스트(- [ ])로
- 라벨: 버그 / 고도화 / 리팩터링 / 백로그 / 문서수정 중 해당
- 마일스톤: 해당 Phase(P0~P3) 연결
- project: ARS / assignee: @me
- Start date: 잠정값(오늘) → 5단계에서 첫 커밋일로 갱신
- Target date: 마일스톤 기한 / End date: 비워두고 5단계에서 PR 생성일로
- 생성 후 이슈 번호를 사용자에게 알린다.

### 2단계 — 브랜치 생성

- `git checkout develop && git pull origin develop` (develop 최신화 먼저)
- `git checkout -b <type>/<간단한-설명>` (예: `feat/album-hub-tabs`)
- 브랜치명에 `#`·공백 금지. type은 feat/fix/refactor/chore/docs.
- ⚠️ 반드시 `develop`에서 분기. `main`에서 따지 않는다.

### 3단계 — 작업 진행

- 코드/마이그레이션 작업 수행.
- 마이그레이션은 반드시 **"파일 먼저 작성(supabase/migrations/) → 커밋 → DB 적용"** 순서.
DB에 직접 SQL 실행 후 파일 누락 금지 (유령 마이그레이션 재발 방지).
- 파괴적 스키마 변경(컬럼 삭제/타입 변경)은 마이그레이션+코드 수정을 같은 브랜치에서
함께 완료하고 로컬 검증 후 커밋. (갤러리 스키마 재설계 = P1 리스크, 특히 주의)
- 기능 = 명세 + 코드 + 테스트 세트로 진행.

### 4단계 — 커밋 (Claude 직접 실행)

1. `git status` / `git diff --stat` 로 변경 확인
2. `.env.local` 등 비밀 파일이 안 잡혔는지 반드시 확인 (.gitignore `.env*`)
3. **여러 줄 커밋 메시지는 임시 파일 작성 후 `F`로 읽는다** (PowerShell 개행 방식 금지 — 본문 소실 위험):
    - `scratchpad/commit_msg.txt`에 작성 → `git add . && git commit -F scratchpad/commit_msg.txt`
4. 형식: `"<type>: <한 줄 요약> (#이슈번호)"` + 본문. 이슈 종료 시 본문에 `Closes #N`.
5. `git push -u origin <브랜치명>`

### 5단계 — PR 생성 + 머지 여부 질문 (기능 → develop)

- `gh pr create --base develop --title "..." --body "... Closes #이슈번호"`
- PR 생성 후 사용자에게 PR 링크 알림 + 프로젝트 필드 갱신
(Start date → 실제 첫 커밋일 / End date → PR 생성일 / Target date → 마일스톤 기한 일치).
- **사용자에게 머지 여부를 질문한다:**
    
    > "PR #N 생성했습니다. develop으로 머지할까요? (검토 후 직접 하시려면 '내가 할게')"
    > 
- **승인("머지해/OK") 시** → Claude가 `gh pr merge --squash` 실행.
- **"내가 할게"·무응답·모호** → 멈춘다. 임의 머지 금지.

### 6단계 — develop → main 승격 (⚠️ 프로덕션 반영)

- develop에 기능이 충분히 쌓이고 안정화됐을 때만.
- `gh pr create --base main --head develop` 로 승격 PR 생성.
- **반드시 별도로 명시적 질문:**
    
    > "develop → main 승격은 프로덕션(Vercel) 배포로 이어집니다. 진행할까요?"
    > 
- 5단계와 별개로 **매번 따로** 확인. 5단계 승인이 6단계를 대신하지 않는다.
- 승인 시 머지, 아니면 멈춤.

### 7단계 — 머지 후 로컬 정리

- `git checkout develop && git pull origin develop`
- `git branch -d <작업브랜치>`
- main 반영 시: `git checkout main && git pull origin main`

──────────────────────────────────────────

## 🖥️ 커밋 메시지 규칙 (Windows/PowerShell)

- Bash heredoc(`$(cat <<'EOF' ...)`) 금지 — PowerShell에서 깨짐.
- PowerShell 큰따옴표 개행(`git commit -m "...여러 줄..."`)도 본문 소실 위험 → 금지.
- 여러 줄은 임시 파일 + `git commit -F` (4단계 참고).
- 이미 push된 커밋 메시지 오류 시: `git commit --amend` → `git push --force-with-lease` (`-force` 단독 금지).

### 커밋 메시지 정확성 원칙

- "확인 완료/정상 동작"은 실제 검증한 케이스를 명시. 미검증을 검증했다고 단정 금지.
- 알려진 제한사항은 숨기지 않고 커밋 메시지에 명시.

──────────────────────────────────────────

## 🔐 보안·환경 규칙

- **Spotify client_secret·SERVICE_ROLE_KEY는 서버(Route Handler)에서만.** 클라 노출 절대 금지.
- `.env.local` 절대 커밋 금지. 커밋 전 항상 확인.
- Supabase RLS 필수: 쓰기는 본인 소유(`auth.uid() = author/user_id`), 열람은 공개 테이블 anon.
- 관리자 전용(앨범 보정·공지·요청 승인)은 `is_admin` 정책.

──────────────────────────────────────────

## 🧩 프로젝트 컨벤션

- 스택: Next.js(App Router) + TypeScript + Tailwind + Supabase + Vercel.
- 디렉토리: Supabase 클라이언트 `src/lib/supabase/`, 컴포넌트 `src/components/`.
- **모바일 우선**: 기본 스타일 모바일 기준, 반응형은 `md:`/`lg:`로만. 분기 767px.
- 색/간격/컴포넌트는 **05. Design-System 토큰만** 사용. 임의 값 금지 (Semantic 경유, Brand 직접 사용 금지).
- posts는 board_type으로 분기(gallery/promo/qa/update). 좋아요·댓글 polymorphic.
- likes 동시성 = unique + `ON CONFLICT DO NOTHING`. 목록은 키셋 커서(offset 금지).

──────────────────────────────────────────

## 실행 범위 요약

- **Claude 직접**: 이슈 생성 / 브랜치 / 커밋 / push / PR 생성 / **승인 시 머지** / 머지 후 정리
- **사용자 판단 지점**: 머지 여부 (질문에 "OK/머지해" 승인 시 Claude 실행 · develop→main은 매번 별도 확인)