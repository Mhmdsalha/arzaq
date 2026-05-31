import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "تعيين كلمة مرور جديدة",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return <ResetPasswordForm email={email ?? ""} />;
}
