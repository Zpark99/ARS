# 디자인 시스템 토큰화 (구조·근거)

## 토큰 코드화 범위 · #81, #82
- 05 Design-System 문서의 값을 `globals.css`의 `@theme` 토큰으로 코드화
- Color/Brand 7종: 기존 값이 이미 05 문서와 일치 확인 → 변경 없음
- Color/Semantic 4종 신규: `hot`(accent 별칭) / `surface-raised` / `success` / `danger`
- Typography 5종 신규: display(28/36/700) / title(20/28/600) / subtitle(16/24/600) / body(14/22/400) / caption(12/16/400)
- Radius(sm6/md10/lg14)·Spacing(4/8/12/16/24/32)는 Tailwind 기본 스케일이 이미 커버 → 커스텀 토큰을 추가로 만들지 않음(YAGNI). `full`도 Tailwind 기본 `rounded-full` 재사용
- Pretendard는 `next/font/local`로 self-host

## 공용 레이아웃·기초 컴포넌트도 토큰만 사용 · #83 (#84, #85)
- GlobalHeader/TabBar/GlobalFooter(#84), Button/Avatar/Input/CategoryTab/SectionHeader/CarouselArrow(#85) 전부 임의 색상·폰트값 없이 토큰(@theme)만 참조
- 아이콘은 lucide-react 미설치 상태라 신규 의존성 추가 대신 기존 인라인 SVG 패턴 재사용 (#84)

## 컨테이너 폭 정렬 규칙 (1364px)
- 페이지 콘텐츠 컨테이너와 `GlobalHeader`/`GlobalFooter`가 서로 다른 `max-w`(1280 vs 컨텐츠)를 쓰면서 좌우 끝이 어긋나던 문제 확인 (#89 아카이브 작업 중 발견)
- `max-w-screen-xl`(1280) → `max-w-[1364px]`로 헤더·푸터를 콘텐츠 컨테이너에 맞춤. 모바일 패딩도 `px-6`→`px-4`로 콘텐츠와 통일
- 같은 규칙을 앨범 허브에도 적용 (#93, fix 126bb29)

## 남은 작업
- #85 DoD 잔여: Figma 캡처 대비 픽셀 단위 대조 (파일 접근 없이 스펙 문서 기준으로만 작업했던 부분)
