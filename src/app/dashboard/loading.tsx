export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-40 animate-pulse rounded-3xl bg-white shadow-sm" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="grid gap-6">
            <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
            <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
