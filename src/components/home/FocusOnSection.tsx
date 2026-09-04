// 이달의 뮤지션 데이터 — 매달 수동 업데이트
const FEATURED = {
  artistName: '잔나비',
  label: '페포니 뮤직',
  youtubeId: 'QolMDs0akR8',
  quote: '알록달록 저희랑 재밌게 놀아요.',
}

export default function FocusOnSection() {
  return (
    <section className="px-4">
      <div className="mb-3">
        <p className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-0.5">
          Focus - on
        </p>
        <h2 className="text-lg font-bold text-text">이달의 뮤지션</h2>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border">
        {/* 영상 — 16:9 비율, 최대 너비 제한 */}
        <div className="relative w-2/5 mx-auto aspect-video bg-surface">
          <iframe
            src={`https://www.youtube.com/embed/${FEATURED.youtubeId}`}
            title={`${FEATURED.artistName} 영상`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* 아티스트 정보 */}
        <div className="px-4 py-4 flex flex-col gap-1.5">
          <p className="text-xs text-text-muted">
            소속 — {FEATURED.label}
          </p>
          <p className="text-base font-bold text-text">{FEATURED.artistName}</p>
          <p className="text-sm text-text-muted leading-relaxed">
            &ldquo;{FEATURED.quote}&rdquo;
          </p>
        </div>
      </div>
    </section>
  )
}
