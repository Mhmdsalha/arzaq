import { BadgeCheck, BriefcaseBusiness, MapPin, Star } from "lucide-react";
import Image from "next/image";

import { ProviderPortfolio } from "@/components/providers/provider-portfolio";
import { ProviderReviews } from "@/components/providers/provider-reviews";
import { ReportButton } from "@/components/shared/report-button";
import { StarRating } from "@/components/shared/star-rating";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Card, CardContent } from "@/components/ui/card";
import { regionLabels } from "@/constants/regions";
import type { ProviderProfile as ProviderProfileType } from "@/types/marketplace";

export function ProviderProfile({ provider }: { provider: ProviderProfileType }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <article className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Image
                src={provider.avatarUrl}
                alt={provider.name}
                width={128}
                height={128}
                className="size-28 rounded-3xl object-cover"
              />
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold text-slate-950">{provider.name}</h1>
                  {provider.isTrusted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark">
                      <BadgeCheck className="size-4" />
                      موثوق
                    </span>
                  ) : null}
                </div>
                <p className="text-lg font-medium text-slate-700">{provider.title}</p>
                <p className="leading-8 text-slate-600">{provider.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {provider.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProviderPortfolio items={provider.portfolio} links={provider.portfolioUrls ?? []} />
        <ProviderReviews reviews={provider.reviews} />
      </article>

      <aside className="space-y-4">
        <Card className="sticky top-24">
          <CardContent className="space-y-5 p-6">
            <div className="grid grid-cols-2 gap-3">
              <Metric icon={Star} label="التقييم" value={provider.rating.toFixed(1)} />
              <Metric
                icon={BriefcaseBusiness}
                label="أعمال مكتملة"
                value={`${provider.completedJobs}`}
              />
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {regionLabels[provider.region]}
              </p>
              <div>
                <p className="mb-2 font-semibold text-slate-950">متوسط التقييم</p>
                <StarRating value={provider.rating} showValue size="md" />
              </div>
            </div>
            <WhatsAppButton
              phone={provider.whatsapp}
              className="w-full"
              label="تواصل مع مقدم الخدمة"
            />
            <ReportButton
              targetType="USER"
              targetId={provider.id}
              label="الإبلاغ عن المستخدم"
              className="w-full"
            />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center">
      <Icon className="mx-auto size-5 text-primary" />
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
