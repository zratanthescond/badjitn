"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PostPurchaseWorkPrompt({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const t = useTranslations("postPurchaseWorkPrompt");

  const handleGoHome = () => {
    setOpen(false);
    router.push("/");
  };

  const handleSubmitWork = () => {
    setOpen(false);
    router.push(`/events/${eventId}/submit-work`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) {
            router.push("/");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-background/95 p-0">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{t("title")}</DialogTitle>
              <DialogDescription className="text-white/90">
                {t("description", { eventTitle })}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 px-6 py-6">
            <p className="text-sm leading-6 text-muted-foreground">{t("body")}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={handleGoHome}
              >
                {t("goHome")}
              </Button>
              <Button
                type="button"
                className="rounded-2xl"
                onClick={handleSubmitWork}
              >
                {t("submitWork")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
