import { redirect } from "next/navigation";

import { ProviderVerificationCard } from "@/components/profile/provider-verification-card";
import { ProfileForm } from "@/components/profile/profile-form";
import { auth } from "@/lib/auth";
import { getProfileByUserId } from "@/services/profile.service";
import { getProviderVerificationSummary } from "@/services/provider-verification.service";

export const metadata = {
  title: "بروفايلي",
};

export default async function DashboardProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const [data, verificationSummary] = await Promise.all([
    getProfileByUserId(session.user.id),
    getProviderVerificationSummary(session.user.id),
  ]);

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

      <ProviderVerificationCard summary={verificationSummary} />

      <ProfileForm data={data} />
    </div>
  );
}
