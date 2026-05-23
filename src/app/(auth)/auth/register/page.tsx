import { RegisterForm } from "@/components/auth/register-form";
import { getRegistrationSkills } from "@/services/auth.service";

export const metadata = {
  title: "إنشاء حساب",
};

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const skills = await getRegistrationSkills();

  return <RegisterForm skills={skills} />;
}
