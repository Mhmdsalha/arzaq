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
      <div className="container py-8 sm:py-10">
        {breadcrumbs.length > 0 ? (
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary-dark">
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          {description ? <p className="text-base leading-8 text-slate-600">{description}</p> : null}
        </div>
      </div>
    </section>
  );
}
