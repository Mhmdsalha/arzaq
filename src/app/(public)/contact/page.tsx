import { Mail, MapPin, MessageCircle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "تواصل معنا",
  description: "تواصل مع فريق أرزاق للاقتراحات، الشراكات، الدعم، أو المساعدة في إطلاق المنصة.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        title="تواصل معنا"
        description="للاقتراحات، الشراكات، أو دعم إطلاق المنصة في المجتمع المحلي."
        breadcrumbs={[{ label: "تواصل معنا" }]}
      />
      <section className="container grid gap-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-4">
          <ContactItem
            icon={MessageCircle}
            title="واتساب"
            description="الأسرع للتواصل في المرحلة الحالية."
          />
          <ContactItem icon={Mail} title="البريد" description="hello@arzaq.local" />
          <ContactItem icon={MapPin} title="النطاق" description="غزة · أونلاين وميداني" />
          <WhatsAppButton phone="970599000000" className="w-full sm:w-auto" />
        </aside>

        <form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">أرسل رسالة</h2>
          <p className="mt-2 text-sm text-slate-600">
            النموذج واجهة فقط في Phase 1، والإرسال الفعلي لاحقًا.
          </p>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              الاسم
              <Input placeholder="اكتب اسمك" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              رقم الجوال
              <Input placeholder="059..." />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              الرسالة
              <textarea
                rows={5}
                placeholder="كيف يمكننا مساعدتك؟"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <Button type="button">إرسال لاحقًا</Button>
          </div>
        </form>
      </section>
    </main>
  );
}

function ContactItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
          <Icon className="size-6" />
        </div>
        <div>
          <h2 className="font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-7 text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
