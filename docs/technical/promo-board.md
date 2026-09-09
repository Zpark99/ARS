# 홍보게시판 (스키마·정책 근거)

## board_type 확장 · #77, #78
- 06 화면정의서 §2.5 기준. `board_posts.board_type` CHECK에 `'promo'` 추가(마이그레이션 013)
- `artist_id`(FK→artists) · `album_id`(FK→albums) 컬럼 추가. 처음엔 promo 글에 한해 조건부 CHECK(`board_posts_promo_requires_artist_album`)로 연결을 필수화

## 필수 연결 → 선택 연결로 정책 전환 · #79, #80
- 근거: #78에서 건 "팀·앨범 연결 필수"가 진입장벽으로 작동 — 피벗 원점인 "디깅 장벽 낮추기"와 정면 충돌
- 스키마 레벨(컬럼·FK)은 유지하고 **조건부 CHECK만 제거**(마이그레이션 014, 기존 013 파일은 수정하지 않고 새 마이그레이션으로 DROP CONSTRAINT) — 소급 수정이 아니라 정책 변경을 새 마이그레이션으로 쌓는 방식 채택
- 앱 레벨: `BoardPostForm`의 `isValid`에서 artist·album 검증 제거(제목+본문만 필수), `requiresArtistAlbum()` 삭제
- UX: select 드롭다운 → `datalist` 기반 검색 콤보박스로 교체 — 타이핑 필터, **정확히 일치해야만** artist_id/album_id로 연결(부분 입력은 연결 안 됨), 안 골라도 제출 가능

## 남은 작업
- 실제 게시글 목록 실데이터 연동 및 홍보 탭(#93 앨범 허브) 필터 연동은 #88에서 진행
