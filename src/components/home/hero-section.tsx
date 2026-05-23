import { Search } from "lucide-react";
import Link from "next/link";

const chips = [
  { label: "💻 رقمي", href: "/jobs?q=رقمي" },
  { label: "📚 تعليمي", href: "/jobs?q=تعليمي" },
  { label: "🔧 ميداني", href: "/jobs?q=ميداني" },
  { label: "📋 فرص يومية", href: "/jobs?q=فرص يومية" },
  { label: "🏠 عمل من البيت", href: "/jobs?q=عمل من البيت" },
];

const stats = [
  { number: "٢٠٠+", label: "طلب نشط" },
  { number: "١٥٠+", label: "مقدم خدمة" },
  { number: "٥", label: "مناطق في غزة" },
];

export function HeroSection() {
  return (
    <section className="relative isolate -mt-0 min-h-[100svh] overflow-hidden rounded-b-[2.5rem] bg-[#16a34a] font-cairo text-white shadow-xl md:min-h-[88vh]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#15803d]/90 via-[#16a34a]/90 to-[#4ade80]/90" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.95)_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="hero-blob-y absolute -right-[5%] -top-[10%] size-[400px] rounded-full bg-white/10 blur-[80px]" />
      <div className="hero-blob-x absolute bottom-[10%] left-[5%] size-[300px] rounded-full bg-primary-light/15 blur-[60px]" />
      <div className="hero-blob-pulse absolute left-[40%] top-[40%] size-[200px] rounded-full bg-white/5 blur-[100px]" />

      <div className="container relative z-10 flex min-h-[100svh] items-center justify-center px-4 pb-28 pt-24 text-center md:min-h-[88vh] md:pb-32 md:pt-28">
        <div className="hero-enter mx-auto flex w-full max-w-3xl flex-col items-center">
          <div className="hero-enter hero-delay-100 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            منصة العمل والخدمات المحلية في غزة 🇵🇸
          </div>

          <h1 className="hero-enter hero-delay-200 mt-7 font-palestine font-bold leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <span className="block text-5xl sm:text-6xl lg:text-7xl">أرزاق</span>
            <span className="mt-3 block text-4xl sm:text-5xl lg:text-6xl">شغلك وخدمتك</span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl">أقرب مما تتخيل</span>
          </h1>

          <p className="hero-enter hero-delay-300 mt-6 max-w-md text-base leading-8 text-white/85 md:text-lg">
            ابحث عن خدمة، انشر طلبك، أو قدّم مهاراتك لأهلك في غزة بطريقة منظمة وموثوقة
          </p>

          <form
            action="/jobs"
            className="hero-enter-scale hero-delay-400 mt-7 flex h-14 w-full max-w-lg items-center gap-2 rounded-2xl bg-white p-2 text-slate-950 shadow-xl"
          >
            <Search className="mr-2 size-5 shrink-0 text-slate-400" />
            <input
              type="search"
              name="q"
              placeholder="ابحث عن خدمة أو طلب عمل..."
              className="min-w-0 flex-1 border-none bg-transparent p-0 text-right font-cairo text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0"
            />
            <button
              type="submit"
              className="h-10 rounded-xl bg-primary px-6 text-sm font-medium text-white transition hover:bg-primary-dark"
            >
              بحث
            </button>
          </form>

          <div className="mt-5 w-full max-w-3xl overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 text-sm text-white/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 font-medium">تصفح حسب:</span>
              {chips.map((chip, index) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="hero-enter hero-delay-500 shrink-0 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm text-white transition hover:bg-white/25"
                  style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hero-enter hero-delay-700 mt-8 grid w-full max-w-lg grid-cols-3 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={index === 0 ? "" : "border-r border-white/20 max-sm:border-r-0"}
              >
                <p className="font-palestine text-2xl font-bold text-white md:text-3xl">
                  {stat.number}
                </p>
                <p className="mt-1 text-xs text-white/75">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <svg
        className="absolute bottom-0 left-0 z-10 h-20 w-full text-slate-50"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,72 C180,112 360,104 540,78 C720,52 900,22 1080,44 C1260,66 1380,98 1440,86 L1440,120 L0,120 Z"
        />
      </svg>
    </section>
  );
}
