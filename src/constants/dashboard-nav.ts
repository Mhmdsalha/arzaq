import {
  Bookmark,
  BriefcaseBusiness,
  Home,
  Inbox,
  LayoutDashboard,
  PlusCircle,
  Search,
  Send,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
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
    href: "/store",
    label: "المتجر",
    icon: Store,
    exact: true,
  },
  {
    href: "/dashboard/store",
    label: "متجري",
    icon: ShoppingBag,
  },
  {
    href: "/dashboard/orders",
    label: "طلباتي من المتجر",
    icon: ShoppingCart,
  },
  {
    href: "/dashboard/orders/received",
    label: "طلبات المتجر الواردة",
    icon: Inbox,
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
