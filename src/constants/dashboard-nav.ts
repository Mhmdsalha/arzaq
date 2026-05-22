import {
  Bookmark,
  BriefcaseBusiness,
  LayoutDashboard,
  PlusCircle,
  Send,
  Settings,
  UserRound,
} from "lucide-react";

export const dashboardNavLinks = [
  {
    href: "/dashboard",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/profile",
    label: "بروفايلي",
    icon: UserRound,
  },
  {
    href: "/dashboard/jobs",
    label: "طلباتي",
    icon: BriefcaseBusiness,
  },
  {
    href: "/dashboard/jobs/new",
    label: "نشر طلب",
    icon: PlusCircle,
  },
  {
    href: "/dashboard/offers",
    label: "عروضي",
    icon: Send,
  },
  {
    href: "/dashboard/saved",
    label: "المحفوظات",
    icon: Bookmark,
  },
  {
    href: "/dashboard/settings",
    label: "الإعدادات",
    icon: Settings,
  },
];
