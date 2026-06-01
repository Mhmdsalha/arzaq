"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, MapPin, Shield, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const slides = [
  {
    icon: Briefcase,
    title: "انشر طلبك في ثوان",
    description: "صف ما تحتاجه وحدد ميزانيتك واستقبل العروض من مقدمي الخدمات.",
    mock: <JobPostMock />,
  },
  {
    icon: Star,
    title: "مقدمو خدمات موثوقون",
    description: "كل مقدم خدمة يملك بروفايلا واضحا وتقييمات تساعدك على اتخاذ قرار أفضل.",
    mock: <ProviderMock />,
  },
  {
    icon: MapPin,
    title: "خدمات من جميع مناطق غزة",
    description: "شمال غزة، مدينة غزة، الوسطى، خانيونس، رفح، وأونلاين.",
    mock: <RegionsMock />,
  },
  {
    icon: Zap,
    title: "طلبات عاجلة؟ لا مشكلة",
    description: "ميز طلبك كعاجل لتصل العروض بشكل أسرع.",
    mock: <UrgentMock />,
  },
  {
    icon: Shield,
    title: "بيئة آمنة وموثوقة",
    description: "نظام تقييمات وبلاغات يساعد على تجربة نظيفة لجميع المستخدمين.",
    mock: <TrustMock />,
  },
];

export function GreenMarketingPanel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slide = slides[currentSlide];
  const Icon = slide.icon;

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setCurrentSlide((value) => (value + 1) % slides.length);
      }
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  return (
    <aside className="relative flex h-full w-full overflow-hidden bg-[linear-gradient(135deg,#15803d_0%,#16a34a_48%,#22c55e_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[length:24px_24px] opacity-[0.06]" />
      <div className="auth-blob-float absolute -right-24 -top-24 size-[300px] rounded-full bg-white/10 blur-[60px]" />
      <div className="auth-blob-float-x absolute -bottom-20 -left-20 size-[250px] rounded-full bg-green-300/20 blur-[50px]" />
      <div className="absolute -right-28 top-12 size-[400px] rounded-full border border-white/10" />
      <div className="absolute bottom-12 left-10 size-[200px] rounded-full border border-white/10" />

      <div
        className="relative z-10 flex w-full flex-col items-center justify-center px-12 text-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="mb-14">
          <p className="font-palestine text-5xl font-bold leading-snug text-white drop-shadow-sm xl:text-6xl">
            معا نبني الفرص
          </p>
        </div>

        <div className="min-h-[360px] w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Icon className="size-8 text-white" />
              </div>
              <h2 className="font-palestine text-2xl font-bold leading-9">{slide.title}</h2>
              <p className="mt-3 max-w-sm font-cairo text-sm leading-7 text-white/75">
                {slide.description}
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.12 }}
                className="mt-6 w-full"
              >
                {slide.mock}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-label={`عرض ${index + 1}`}
              className={cn(
                "h-2 rounded-full bg-white/40 transition-all duration-300",
                index === currentSlide ? "w-7 bg-white" : "w-2 hover:bg-white/70",
              )}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-3 font-cairo text-sm text-white/75">
        <span>نهدف إلى</span>
        <span>200+ طلب</span>
        <span className="text-white/40">·</span>
        <span>150+ مقدم خدمة</span>
        <span className="text-white/40">·</span>
        <span>5 مناطق</span>
      </div>
    </aside>
  );
}

function MockCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[280px] rounded-2xl bg-white p-4 text-right shadow-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

function JobPostMock() {
  return (
    <MockCard>
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          رقمي
        </span>
        <span className="text-xs text-slate-400">قبل 10 دقائق</span>
      </div>
      <p className="font-cairo text-sm font-bold text-slate-900">تصميم هوية لمشروع صغير</p>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="font-semibold text-green-700">80 شيكل</span>
        <span className="text-slate-500">3 عروض وردت</span>
      </div>
    </MockCard>
  );
}

function ProviderMock() {
  return (
    <MockCard>
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-base font-bold text-green-700">
          س
        </div>
        <div>
          <p className="font-cairo text-sm font-bold text-slate-900">سارة أحمد</p>
          <p className="mt-1 text-xs text-slate-500">مصممة جرافيك وهوية بصرية</p>
          <p className="mt-1 text-xs text-amber-500">★★★★★ 4.9</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">تصميم</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">شعارات</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="font-semibold text-green-700">موثقة</span>
        <span className="text-slate-500">18 عمل مكتمل</span>
      </div>
    </MockCard>
  );
}

function RegionsMock() {
  const regions = ["شمال غزة", "مدينة غزة", "الوسطى", "خانيونس", "رفح", "أونلاين"];

  return (
    <MockCard>
      <div className="flex flex-wrap gap-2">
        {regions.map((region) => (
          <span key={region} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {region}
          </span>
        ))}
      </div>
    </MockCard>
  );
}

function UrgentMock() {
  return (
    <MockCard className="border-r-4 border-r-amber-500 bg-amber-50">
      <div className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
        عاجل
      </div>
      <p className="font-cairo text-sm font-bold text-slate-900">مساعدة ميدانية اليوم</p>
      <p className="mt-2 text-xs text-slate-500">وصلت 5 عروض خلال ساعة</p>
    </MockCard>
  );
}

function TrustMock() {
  return (
    <MockCard>
      <div className="flex items-center justify-center gap-3 text-sm font-semibold text-slate-700">
        <span>موثق</span>
        <span>⭐ 4.9</span>
        <span>آمن</span>
      </div>
    </MockCard>
  );
}
