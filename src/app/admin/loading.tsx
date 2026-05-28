export default function AdminLoading() {
  return (
    <section className="grid min-h-[100svh] place-items-center bg-slate-950 px-4 text-center text-white">
      <div className="space-y-4">
        <div className="mx-auto size-11 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm text-slate-300">جاري تحميل لوحة الإدارة...</p>
      </div>
    </section>
  );
}
