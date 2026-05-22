import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function WhatsAppButton({
  phone,
  label = "تواصل عبر واتساب",
  className,
}: {
  phone: string;
  label?: string;
  className?: string;
}) {
  return (
    <Button asChild className={className}>
      <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
        <MessageCircle className="size-4" />
        {label}
      </a>
    </Button>
  );
}
