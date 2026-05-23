import type { AccountType } from "@prisma/client";

export function assertClient(accountType: AccountType): void {
  if (accountType !== "CLIENT") {
    throw new Error("مقدمو الخدمات لا يمكنهم نشر الطلبات");
  }
}

export function assertProvider(accountType: AccountType): void {
  if (accountType !== "PROVIDER") {
    throw new Error("أصحاب الطلبات لا يمكنهم تقديم عروض");
  }
}
