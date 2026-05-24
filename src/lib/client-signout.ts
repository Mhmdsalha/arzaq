"use client";

import { signOut } from "next-auth/react";

export async function signOutAndRedirect() {
  const result = await signOut({
    callbackUrl: "/",
    redirect: false,
  });

  window.location.assign(result.url || "/");
}
