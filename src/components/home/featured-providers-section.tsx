import Link from "next/link";

import { ProviderCard } from "@/components/providers/provider-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { ProviderProfile } from "@/types/marketplace";

export function FeaturedProvidersSection({
  providers,
  mode = "featured",
}: {
  providers: ProviderProfile[];
  mode?: "trusted" | "featured";
}) {
  const isTrustedMode = mode === "trusted";

  return (
    <section className="section-spacing bg-slate-50">
      <div className="container-responsive space-y-6 lg:space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">
              {isTrustedMode ? "مقدمو خدمات موثقون من الإدارة" : "مقدمو خدمات بارزون"}
            </h2>
            <p className="mt-2 text-slate-600">
              {isTrustedMode
                ? "تظهر هنا الحسابات التي تم توثيقها رسمياً بعد تنفيذ عروض مقبولة."
                : "تظهر هنا بعض حسابات مقدمي الخدمات الذين وثقوا بريدهم، مع أولوية للحسابات الموثقة من الإدارة."}
            </p>
          </div>
          <Link href="/providers" className="text-sm font-semibold text-primary-dark">
            عرض كل مقدمي الخدمات
          </Link>
        </div>
        {providers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {providers.slice(0, 4).map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا يوجد مقدمو خدمات بعد"
            description="ستظهر الحسابات هنا بعد تسجيل مقدمي الخدمات وإكمال بروفايلاتهم."
            action={
              <Button asChild variant="secondary">
                <Link href="/providers">تصفح مقدمي الخدمات</Link>
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}
