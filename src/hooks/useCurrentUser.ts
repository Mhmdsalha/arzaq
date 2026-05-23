"use client";

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session, status } = useSession();
  const user = session?.user ?? null;

  return {
    user,
    isLoading: status === "loading",
    isAuth: status === "authenticated",
    isGuest: status === "unauthenticated",
    isClient: user?.accountType === "CLIENT",
    isProvider: user?.accountType === "PROVIDER",
    isAdmin: user?.role === "ADMIN",
  };
}
