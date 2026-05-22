import Image from "next/image";

import type { PortfolioItem } from "@/types/marketplace";

export function ProviderPortfolio({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950">أعمال سابقة</h2>
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
    </section>
  );
}
