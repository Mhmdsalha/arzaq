import { BadgeCheck, BriefcaseBusiness, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StarRating } from "@/components/shared/star-rating";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { regionLabels } from "@/constants/regions";
import type { ProviderProfile } from "@/types/marketplace";

export function ProviderCard({ provider }: { provider: ProviderProfile }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4">
        <Image
          src={provider.avatarUrl}
          alt={provider.name}
          width={72}
          height={72}
          className="size-16 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-slate-950">
              <Link href={`/providers/${provider.id}`}>{provider.name}</Link>
            </h2>
            {provider.isTrusted ? (
              <BadgeCheck className="size-5 fill-primary text-white" aria-label="موثوق" />
            ) : null}
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-slate-600">{provider.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="size-4 text-primary" />
              {regionLabels[provider.region]}
            </span>
            <span className="flex items-center gap-1">
              <BriefcaseBusiness className="size-4 text-primary" />
              {provider.completedJobs} عمل
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-600">{provider.bio}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {provider.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <StarRating value={provider.rating} showValue />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button asChild variant="secondary">
            <Link href={`/providers/${provider.id}`}>الملف</Link>
          </Button>
          <WhatsAppButton phone={provider.whatsapp} label="واتساب" />
        </div>
      </div>
    </article>
  );
}
