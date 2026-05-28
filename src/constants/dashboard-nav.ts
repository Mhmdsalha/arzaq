import {
  Bookmark,
  BriefcaseBusiness,
  Home,
  LayoutDashboard,
  PlusCircle,
  Send,
  Settings,
  Search,
  UserRound,
} from "lucide-react";
import type { AccountType } from "@prisma/client";

export const dashboardNavLinks = [
  {
    href: "/",
    label: "الرئيسية",
    icon: Home,
    exact: true,
  },
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
    accountTypes: ["CLIENT"],
  },
  {
    href: "/dashboard/jobs/new",
    label: "نشر طلب",
    icon: PlusCircle,
    accountTypes: ["CLIENT"],
    featured: true,
  },
  {
    href: "/jobs",
    label: "تصفح الطلبات",
    icon: Search,
    accountTypes: ["PROVIDER"],
    exact: true,
  },
  {
    href: "/dashboard/offers",
    label: "عروضي",
    icon: Send,
    accountTypes: ["PROVIDER"],
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

export function getDashboardNavLinks(accountType: AccountType) {
  return dashboardNavLinks.filter((link) => {
    return !link.accountTypes || link.accountTypes.includes(accountType);
  });
}
