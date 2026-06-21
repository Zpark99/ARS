// app/ranking/loading.tsx
// Next.js 라우트 단위 로딩 스켈레톤. page.tsx의 fetch 동안 자동 노출됨.

export default function RankingLoading() {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6">
      <div className="mb-4 h-7 w-16 animate-pulse rounded-sm bg-surface" />

      <div className="mb-2 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-16 animate-pulse rounded-sm bg-surface" />
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-7 w-14 animate-pulse rounded-sm bg-surface" />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[72px] animate-pulse rounded-md bg-surface" />
        ))}
      </div>
    </main>
  );
}
