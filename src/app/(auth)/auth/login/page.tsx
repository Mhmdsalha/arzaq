import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "تسجيل الدخول",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; callbackUrl?: string }>;
}) {
  const { reset, callbackUrl } = await searchParams;

  return <LoginForm resetSuccess={reset === "success"} callbackUrl={callbackUrl} />;
}
