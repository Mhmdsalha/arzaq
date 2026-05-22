import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "تسجيل الدخول",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

  return <LoginForm resetSuccess={reset === "success"} />;
}
