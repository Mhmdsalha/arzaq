import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
}: {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
}) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="container-responsive pb-4 pt-20 sm:pb-6 lg:pt-24">
        {breadcrumbs.length > 0 ? (
          <nav className="mb-4 flex min-h-11 flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
            <Link href="/" className="flex min-h-11 items-center hover:text-primary-dark">
              الرئيسية
            </Link>
            {breadcrumbs.map((item) => (
              <span key={item.label} className="flex items-center gap-2">
                <span>/</span>
                {item.href ? (
                  <Link href={item.href} className="hover:text-primary-dark">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-700">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <div className="max-w-3xl space-y-3">
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">{title}</h1>
          {description ? <p className="text-sm leading-relaxed text-slate-600 lg:text-base">{description}</p> : null}
        </div>
      </div>
    </section>
  );
}
