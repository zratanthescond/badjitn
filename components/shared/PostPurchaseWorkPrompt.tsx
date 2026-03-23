"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        <DialogContent className="sm:max-w-lg rounded-3xl border border-border/60 bg-background/95 p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Achat confirme
              </DialogTitle>
              <DialogDescription className="text-white/90">
                Votre commande pour {eventTitle} a bien ete prise en compte.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 px-6 py-6">
            <p className="text-sm leading-6 text-muted-foreground">
              Voulez-vous soumettre un travail maintenant ? Si vous confirmez,
              vous serez redirige vers la page de soumission. Sinon, vous serez
              redirige vers l'accueil.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={handleGoHome}
              >
                Non, retourner a l'accueil
              </Button>
              <Button
                type="button"
                className="rounded-2xl"
                onClick={handleSubmitWork}
              >
                Oui, soumettre un travail
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
