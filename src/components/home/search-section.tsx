import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { regions } from "@/mock/regions";

export function SearchSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-8">
      <div className="container">
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <Input placeholder="ما الخدمة أو المهارة التي تبحث عنها؟" className="h-12 pr-11" />
          </div>
          <select className="h-12 rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary">
            <option>كل المناطق</option>
            {regions.map((region) => (
              <option key={region.value}>{region.label}</option>
            ))}
          </select>
          <Button asChild size="lg">
            <Link href="/jobs">ابحث الآن</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
