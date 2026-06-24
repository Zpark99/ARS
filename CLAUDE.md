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

## 커밋

- 커밋은 전부 수동으로 진행, 자동 커밋 금지.
