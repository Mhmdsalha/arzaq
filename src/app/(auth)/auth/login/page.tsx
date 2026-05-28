import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "تسجيل الدخول",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; verified?: string; callbackUrl?: string }>;
}) {
  const { reset, verified, callbackUrl } = await searchParams;

  return (
    <LoginForm
      resetSuccess={reset === "success"}
      verifiedSuccess={verified === "success"}
      callbackUrl={callbackUrl}
    />
  );
}
