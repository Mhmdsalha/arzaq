import { redirect } from "next/navigation";

import { SettingsForms } from "@/components/profile/settings-forms";
import { auth } from "@/lib/auth";
import { getSettingsByUserId } from "@/services/settings.service";

export const metadata = {
  title: "الإعدادات",
};

export default async function DashboardSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const data = await getSettingsByUserId(session.user.id);

  if (!data) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-dark">إعدادات الحساب</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">الإعدادات</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          حدّث وسائل التواصل وكلمة المرور الخاصة بحسابك.
        </p>
      </div>

      <SettingsForms data={data} />
    </div>
  );
}
