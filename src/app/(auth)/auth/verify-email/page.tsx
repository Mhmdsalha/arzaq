import { redirect } from "next/navigation";

import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata = {
  title: "توثيق البريد الإلكتروني",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/auth/register");
  }

  return <VerifyEmailForm email={email} />;
}
