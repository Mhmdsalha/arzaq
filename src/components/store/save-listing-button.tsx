"use client";

import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleSaveListingAction } from "@/actions/listing.actions";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

export function SaveListingButton({
  listingId,
  isSaved,
  className,
  showLabel = false,
}: {
  listingId: string;
  isSaved: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const { isAuth, isLoading } = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const [savedState, setSavedState] = useState(isSaved);
  const [optimisticSaved, toggleOptimisticSaved] = useOptimistic(savedState, (state) => !state);

  function handleSave() {
    if (!isAuth) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/store/${listingId}`)}`);
      return;
    }

    toggleOptimisticSaved(undefined);

    startTransition(async () => {
      const result = await toggleSaveListingAction(listingId);

      if (result.ok) {
        setSavedState(Boolean(result.isSaved));
        toast.success(result.message);
        return;
      }

      toast.error(result.message);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size={showLabel ? "default" : "icon"}
      onClick={handleSave}
      disabled={isPending || isLoading}
      aria-label={optimisticSaved ? "إزالة من المحفوظات" : "حفظ العنصر"}
      className={cn(optimisticSaved && "border-primary bg-primary/10 text-primary-dark", className)}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={cn("size-4", optimisticSaved && "fill-current")} />
      )}
      {showLabel ? (
        <span>{optimisticSaved ? "إزالة من المحفوظات" : "حفظ العنصر"}</span>
      ) : null}
    </Button>
  );
}
