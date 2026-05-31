"use client";

import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleSaveJobAction } from "@/actions/job.actions";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

export function SaveJobButton({
  jobId,
  isSaved,
  className,
}: {
  jobId: string;
  isSaved: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { isAuth, isLoading } = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const [savedState, setSavedState] = useState(isSaved);
  const [optimisticSaved, toggleOptimisticSaved] = useOptimistic(savedState, (state) => !state);

  function handleSave() {
    if (!isAuth) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/jobs/${jobId}`)}`);
      return;
    }

    toggleOptimisticSaved(undefined);

    startTransition(async () => {
      const result = await toggleSaveJobAction(jobId);

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
      size="icon"
      onClick={handleSave}
      disabled={isPending || isLoading}
      aria-label={optimisticSaved ? "إزالة من المحفوظات" : "حفظ الطلب"}
      className={cn(optimisticSaved && "border-primary bg-primary/10 text-primary-dark", className)}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={cn("size-4", optimisticSaved && "fill-current")} />
      )}
    </Button>
  );
}
