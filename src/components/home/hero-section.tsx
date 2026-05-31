import { BriefcaseBusiness, GraduationCap, Home, Monitor, Search, Wrench } from "lucide-react";
import Link from "next/link";

const chips = [
  { label: "رقمي", href: "/jobs?q=رقمي", icon: Monitor },
  { label: "تعليمي", href: "/jobs?q=تعليمي", icon: GraduationCap },
  { label: "ميداني", href: "/jobs?q=ميداني", icon: Wrench },
  { label: "فرص يومية", href: "/jobs?q=فرص يومية", icon: BriefcaseBusiness },
  { label: "عمل من البيت", href: "/jobs?q=عمل من البيت", icon: Home },
];

const stats = [
  { number: "200+", label: "طلب نشط", prefix: "نهدف إلى" },
  { number: "150+", label: "مقدم خدمة", prefix: "نهدف إلى" },
  { number: "5", label: "مناطق في غزة", prefix: "نغطي" },
];

export function HeroSection() {
  return (
    <section
      data-hero-section="true"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#16a34a] font-cairo text-white md:min-h-[112vh]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#15803d_0%,#16a34a_52%,#22c55e_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.14),transparent_34%)]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -right-[12%] -top-[10%] size-[250px] rounded-full bg-white/8 blur-[50px] md:-right-[8%] md:-top-[12%] md:size-[430px] md:blur-[105px]" />
      <div className="absolute bottom-[16%] left-[4%] size-[200px] rounded-full bg-primary-light/12 blur-[50px] md:bottom-[14%] md:left-[5%] md:size-[330px] md:blur-[85px]" />

      <div className="container-responsive relative z-10 flex min-h-[100svh] items-start justify-center pb-28 pt-[calc(6.5rem+env(safe-area-inset-top))] text-center md:box-border md:items-center md:pb-24 md:pt-24">
        <div className="hero-enter mx-auto flex w-full max-w-4xl flex-col items-center">
          <div className="hero-enter hero-delay-100 inline-flex max-w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-sm">
            منصة العمل والخدمات المحلية في غزة
          </div>

          <h1 className="hero-enter hero-delay-200 mt-10 flex flex-col items-center font-palestine font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] sm:mt-10 md:mt-7">
            <span className="hidden pt-2 text-5xl leading-[1.45] md:block lg:text-6xl">
              أرزاق
            </span>
            <span className="flex flex-col items-center leading-[1.05] md:mt-5 md:flex-row md:gap-4 md:leading-[1.25]">
              <span className="text-[3.35rem] sm:text-[3.75rem] md:text-5xl lg:text-6xl">
                معاً
              </span>
              <span className="-mt-1 text-[2.65rem] sm:text-[3.1rem] md:mt-0 md:text-5xl lg:text-6xl">
                نبـــــني الفرص
              </span>
            </span>
          </h1>

          <p className="hero-enter hero-delay-300 mt-4 max-w-xs text-sm leading-relaxed text-white/85 md:mt-12 md:max-w-md md:text-lg">
            ابحث عن خدمة، انشر طلبك، أو قدّم مهاراتك لأهلك في غزة بطريقة منظمة وموثوقة
          </p>

          <div className="hero-enter-scale hero-delay-400 mt-4 w-full max-w-3xl rounded-[1.75rem] bg-white/[0.14] p-2.5 ring-1 ring-white/20 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.17] hover:ring-white/30 md:backdrop-blur-md sm:mt-5 sm:rounded-[2rem] sm:p-4">
            <form
              suppressHydrationWarning
              action="/jobs"
              className="flex min-h-12 w-full items-center gap-2 rounded-[1.25rem] bg-white p-1.5 text-slate-950 ring-1 ring-white/70 transition duration-300 focus-within:ring-2 focus-within:ring-emerald-200/80 sm:min-h-14 sm:p-2"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Search className="size-5" />
              </div>
              <input
                suppressHydrationWarning
                type="search"
                name="q"
                placeholder="ابحث عن خدمة أو طلب عمل..."
                className="min-w-0 flex-1 border-none bg-transparent p-0 text-right font-cairo text-base text-slate-800 placeholder:text-slate-400 focus:ring-0"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg hover:shadow-emerald-900/20 sm:px-7"
              >
                بحث
              </button>
            </form>

            <div className="mt-2 flex items-center gap-2 rounded-[1.35rem] bg-emerald-950/10 px-2.5 py-2 ring-1 ring-white/10 sm:mt-3 sm:gap-3 sm:px-3 sm:py-3">
              <span className="shrink-0 text-xs font-semibold text-white/85 sm:text-sm">
                تصفح حسب
              </span>
              <div className="scrollbar-hide -mx-2 flex gap-2 overflow-x-auto px-2 pb-1 md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0 md:pb-0">
                {chips.map((chip, index) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    className="hero-enter hero-delay-500 inline-flex min-h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition duration-200 hover:scale-[1.03] hover:bg-white/25 hover:ring-white/40 sm:min-h-10 sm:gap-2 sm:px-3.5 sm:text-sm"
                    style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                  >
                    <chip.icon className="size-4" />
                    <span>{chip.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="hero-enter hero-delay-700 mt-2 grid grid-cols-3 gap-2 overflow-hidden rounded-[1.35rem] bg-white/[0.1] ring-1 ring-white/10 sm:mt-3 sm:gap-0 sm:rounded-[1.5rem]">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`px-2 py-2.5 sm:px-3 sm:py-3 ${index === 0 ? "" : "sm:border-r sm:border-white/15"}`}
                >
                  <p className="text-[10px] font-medium text-white/65 sm:text-[11px]">
                    {stat.prefix}
                  </p>
                  <p
                    dir="ltr"
                    className="font-cairo text-lg font-bold tracking-wide text-white sm:text-xl md:text-2xl"
                  >
                    {stat.number}
                  </p>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-white/75 sm:text-xs">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <svg
        className="pointer-events-none absolute bottom-[-2px] left-0 z-10 h-20 w-full text-slate-50 sm:h-28"
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
