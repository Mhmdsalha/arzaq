export function LoadingState({ label = "جاري التحميل..." }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-background px-4 text-center">
      <div className="space-y-3">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}
