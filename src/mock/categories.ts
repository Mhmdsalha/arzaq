import type { Category } from "@/types/marketplace";

export const categories: Category[] = [
  {
    id: "digital",
    name: "خدمات رقمية",
    slug: "digital",
    icon: "MonitorSmartphone",
    description: "تصميم، برمجة، إدخال بيانات، إدارة صفحات، ومحتوى رقمي.",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "education",
    name: "تعليم وتدريب",
    slug: "education",
    icon: "GraduationCap",
    description: "دروس خصوصية، لغات، تدريب مهني، ومتابعة طلاب.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    id: "field",
    name: "خدمات ميدانية",
    slug: "field",
    icon: "MapPinned",
    description: "صيانة، كهرباء، سباكة، تصوير، وتنسيق ميداني.",
    color: "bg-orange-50 text-orange-700",
  },
  {
    id: "daily",
    name: "فرص يومية",
    slug: "daily",
    icon: "BriefcaseBusiness",
    description: "مساعدة مؤقتة، توزيع، تنظيم، أعمال قصيرة، وفرص عاجلة.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    id: "remote",
    name: "عمل من البيت",
    slug: "remote",
    icon: "Home",
    description: "مهام أونلاين مرنة تناسب العمل من المنزل.",
    color: "bg-violet-50 text-violet-700",
  },
  {
    id: "creative",
    name: "إبداع وإنتاج",
    slug: "creative",
    icon: "Palette",
    description: "مونتاج، تصوير منتجات، كتابة محتوى، وهوية بصرية.",
    color: "bg-rose-50 text-rose-700",
  },
];
