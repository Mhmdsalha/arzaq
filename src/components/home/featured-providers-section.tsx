import Link from "next/link";

import { ProviderCard } from "@/components/providers/provider-card";
import type { ProviderProfile } from "@/types/marketplace";

export function FeaturedProvidersSection({ providers }: { providers: ProviderProfile[] }) {
  return (
    <section className="bg-white py-14">
      <div className="container space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">مزودون موثوقون</h2>
            <p className="mt-2 text-slate-600">ملفات مهنية تساعدك تختار الشخص المناسب بسرعة.</p>
          </div>
          <Link href="/providers" className="text-sm font-semibold text-primary-dark">
            عرض كل المزودين
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {providers.slice(0, 4).map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </div>
    </section>
  );
}
