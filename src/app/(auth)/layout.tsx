import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section
        className={cn(
          "w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6",
          "max-w-md has-[.account-type-selector]:max-w-3xl",
        )}
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        {children}
      </section>
    </main>
  );
}
