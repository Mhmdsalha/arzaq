import Image from "next/image";
import Link from "next/link";

import type { PortfolioItem } from "@/types/marketplace";

export function ProviderPortfolio({ items, links = [] }: { items: PortfolioItem[]; links?: string[] }) {
  if (items.length === 0 && links.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950">ملف الأعمال</h2>

      {links.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-950">روابط الأعمال</h3>
          <div className="mt-3 space-y-2">
            {links.map((url, index) => (
              <Link
                key={`${url}-${index}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block truncate rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-primary-dark transition hover:bg-primary/10"
              >
                {url}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={900}
                height={600}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
