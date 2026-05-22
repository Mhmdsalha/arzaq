import type { RegionKey } from "@/types/marketplace";

export const regions: Array<{ value: RegionKey; label: string }> = [
  { value: "NORTH_GAZA", label: "شمال غزة" },
  { value: "GAZA_CITY", label: "مدينة غزة" },
  { value: "CENTRAL", label: "الوسطى" },
  { value: "KHAN_YOUNIS", label: "خانيونس" },
  { value: "RAFAH", label: "رفح" },
  { value: "ONLINE", label: "أونلاين" },
];
