"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteOrder } from "@/lib/actions/order.actions";
import { useToast } from "@/hooks/use-toast";

export default function DeleteOrderButton({
  orderId,
  participantName,
  label,
  title,
  description,
  cancelLabel,
  successMessage,
  errorMessage,
}: {
  orderId: string;
  participantName: string;
  label: string;
  title: string;
  description: string;
  cancelLabel: string;
  successMessage: string;
  errorMessage: string;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteOrder(orderId);
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: successMessage });
      setOpen(false);
    } catch (err) {
      toast({
        title: errorMessage,
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        title={label}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        {label}
      </Button>
      <AlertDialog open={open} onOpenChange={(v) => !isDeleting && setOpen(v)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{participantName}</strong> — {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{cancelLabel}</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "..." : label}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
