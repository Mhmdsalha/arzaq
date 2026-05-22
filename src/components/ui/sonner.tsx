"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return <Sonner toastOptions={{ className: "font-sans" }} {...props} />;
}
