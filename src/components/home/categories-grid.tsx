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
    <section className="bg-white py-14">
      <div className="container space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">التصنيفات الأكثر طلبًا</h2>
            <p className="mt-2 text-slate-600">ابدأ من المجال الأقرب لاحتياجك أو مهارتك.</p>
          </div>
          <Link href="/categories" className="text-sm font-semibold text-primary-dark">
            عرض كل التصنيفات
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap] ?? BriefcaseBusiness;

            return (
              <Link
                key={category.id}
                href={`/jobs?category=${category.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl ${category.color}`}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950 group-hover:text-primary-dark">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{category.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
