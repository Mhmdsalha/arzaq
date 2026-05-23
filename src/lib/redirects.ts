import type { AccountType } from "@prisma/client";

export function getPostLoginRedirect(accountType: AccountType, callbackUrl?: string): string {
  void accountType;

  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  return "/dashboard";
}

export function getAuthRedirect(currentPath: string): string {
  return `/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`;
}

export function getAuthenticatedRedirect(accountType: AccountType): string {
  void accountType;

  return "/dashboard";
}
