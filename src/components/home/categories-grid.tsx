import {
  BriefcaseBusiness,
  GraduationCap,
  Home,
  MapPinned,
  MonitorSmartphone,
  Palette,
} from "lucide-react";
import Link from "next/link";

import type { Category } from "@/types/marketplace";

const iconMap = {
  MonitorSmartphone,
  GraduationCap,
  MapPinned,
  BriefcaseBusiness,
  Home,
  Palette,
};

export function CategoriesGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="section-spacing bg-white">
      <div className="container-responsive space-y-6 lg:space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">التصنيفات الأكثر طلبًا</h2>
            <p className="mt-2 text-slate-600">ابدأ من المجال الأقرب لاحتياجك أو مهارتك.</p>
          </div>
          <Link href="/categories" className="text-sm font-semibold text-primary-dark">
            عرض كل التصنيفات
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-5 lg:gap-4">
          {categories.map((category) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap] ?? BriefcaseBusiness;

            return (
              <Link
                key={category.id}
                href={`/jobs?category=${category.slug}`}
                className="group flex aspect-square flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md lg:aspect-auto lg:items-start lg:p-5 lg:text-right"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-2xl lg:size-12 ${category.color}`}
                >
                  <Icon className="size-5 lg:size-6" />
                </div>
                <h3 className="mt-3 max-w-full truncate text-xs font-bold text-slate-950 group-hover:text-primary-dark lg:mt-4 lg:text-lg">
                  {category.name}
                </h3>
                <p className="mt-2 hidden text-sm leading-7 text-slate-600 lg:block">{category.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
