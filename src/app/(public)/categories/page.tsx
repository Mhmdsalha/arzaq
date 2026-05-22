import {
  BriefcaseBusiness,
  GraduationCap,
  Home,
  MapPinned,
  MonitorSmartphone,
  Palette,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { categories } from "@/mock/categories";

const iconMap = {
  MonitorSmartphone,
  GraduationCap,
  MapPinned,
  BriefcaseBusiness,
  Home,
  Palette,
};

export const metadata = {
  title: "التصنيفات",
};

export default function CategoriesPage() {
  return (
    <main>
      <PageHeader
        title="كل تصنيفات الخدمات"
        description="استكشف المجالات التي تدعمها أرزاق في المرحلة الأولى."
        breadcrumbs={[{ label: "التصنيفات" }]}
      />
      <section className="container grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap] ?? BriefcaseBusiness;

          return (
            <Link
              key={category.id}
              href={`/jobs?category=${category.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`flex size-12 items-center justify-center rounded-2xl ${category.color}`}
              >
                <Icon className="size-6" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-950">{category.name}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{category.description}</p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
