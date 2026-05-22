import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { auth } from "@/lib/auth";
import { getProfileByUserId } from "@/services/profile.service";

export const metadata = {
  title: "بروفايلي",
};

export default async function DashboardProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const data = await getProfileByUserId(session.user.id);

  if (!data) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-dark">إدارة البروفايل</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">بروفايلي</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          حدّث بياناتك ومهاراتك وروابط أعمالك حتى يظهر ملفك بثقة أكبر عند التقديم على الطلبات.
        </p>
      </div>

      <ProfileForm data={data} />
    </div>
  );
}
