import { ClipboardList, GraduationCap, Home, Monitor, Search, Wrench } from "lucide-react";
import Link from "next/link";

const chips = [
  { label: "رقمي", href: "/jobs?q=رقمي", icon: Monitor },
  { label: "تعليمي", href: "/jobs?q=تعليمي", icon: GraduationCap },
  { label: "ميداني", href: "/jobs?q=ميداني", icon: Wrench },
  { label: "فرص يومية", href: "/jobs?q=فرص يومية", icon: ClipboardList },
  { label: "عمل من البيت", href: "/jobs?q=عمل من البيت", icon: Home },
];

const stats = [
  { number: "200+", label: "طلب نشط" },
  { number: "150+", label: "مقدم خدمة" },
  { number: "5", label: "مناطق في غزة" },
];

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[118svh] overflow-hidden bg-[#16a34a] font-cairo text-white md:min-h-[112vh]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#15803d_0%,#16a34a_52%,#22c55e_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.14),transparent_34%)]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -right-[8%] -top-[12%] size-[430px] rounded-full bg-white/8 blur-[105px]" />
      <div className="absolute bottom-[14%] left-[5%] size-[330px] rounded-full bg-primary-light/12 blur-[85px]" />

      <div className="container relative z-10 flex min-h-[100svh] items-center justify-center px-4 pb-28 pt-20 text-center md:box-border md:min-h-screen md:pb-24 md:pt-24">
        <div className="hero-enter mx-auto flex w-full max-w-4xl flex-col items-center">
          <div className="hero-enter hero-delay-100 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            منصة العمل والخدمات المحلية في غزة
          </div>

          <h1 className="hero-enter hero-delay-200 mt-5 flex flex-col items-center font-palestine font-bold leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <span className="block text-5xl leading-[1.18] sm:text-6xl lg:text-6xl">أرزاق</span>
            <span className="mt-5 block text-4xl leading-[1.28] sm:text-5xl lg:text-6xl">
              معاً نصنع الفرص
            </span>
          </h1>

          <p className="hero-enter hero-delay-300 mt-7 max-w-md text-base leading-8 text-white/85 md:mt-8 md:text-lg">
            ابحث عن خدمة، انشر طلبك، أو قدّم مهاراتك لأهلك في غزة بطريقة منظمة وموثوقة
          </p>

          <div className="hero-enter-scale hero-delay-400 mt-5 w-full max-w-3xl rounded-[2rem] bg-white/[0.14] p-3 ring-1 ring-white/20 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.17] hover:ring-white/30 sm:p-4">
            <form
              action="/jobs"
              className="flex min-h-14 w-full items-center gap-2 rounded-[1.35rem] bg-white p-2 text-slate-950 ring-1 ring-white/70 transition duration-300 focus-within:ring-2 focus-within:ring-emerald-200/80"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Search className="size-5" />
              </div>
              <input
                type="search"
                name="q"
                placeholder="ابحث عن خدمة أو طلب عمل..."
                className="min-w-0 flex-1 border-none bg-transparent p-0 text-right font-cairo text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0 sm:text-base"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg hover:shadow-emerald-900/20 sm:px-7"
              >
                بحث
              </button>
            </form>

            <div className="mt-3 flex items-center gap-3 rounded-[1.5rem] bg-emerald-950/10 px-3 py-3 ring-1 ring-white/10">
              <span className="shrink-0 text-xs font-semibold text-white/85 sm:text-sm">
                تصفح حسب
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap md:justify-center md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
                {chips.map((chip, index) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    className="hero-enter hero-delay-500 inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white/15 px-3.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition duration-200 hover:scale-[1.03] hover:bg-white/25 hover:ring-white/40 sm:text-sm"
                    style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                  >
                    <chip.icon className="size-4" />
                    <span>{chip.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="hero-enter hero-delay-700 mt-3 grid grid-cols-3 overflow-hidden rounded-[1.5rem] bg-white/[0.1] ring-1 ring-white/10">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`px-3 py-3 ${index === 0 ? "" : "border-r border-white/15"}`}
                >
                  <p
                    dir="ltr"
                    className="font-cairo text-xl font-bold tracking-wide text-white md:text-2xl"
                  >
                    {stat.number}
                  </p>
                  <p className="mt-1 text-xs font-medium text-white/75">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <svg
        className="pointer-events-none absolute bottom-[-2px] left-0 z-10 h-28 w-full text-slate-50"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,84 C180,118 366,112 550,86 C742,59 886,34 1072,52 C1248,69 1348,100 1440,90 L1440,130 L0,130 Z"
        />
      </svg>
    </section>
  );
}
