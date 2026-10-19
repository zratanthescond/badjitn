"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateOrderInfo } from "@/lib/actions/order.actions";
import { useToast } from "@/hooks/use-toast";

type Info = { label?: string; field?: string; type?: string; value?: string };

// Work-submission answers are long free text edited elsewhere; files can't be typed.
const isEditable = (info: Info) =>
  !String(info.field || "").startsWith("work") && info.type !== "file";

export default function EditOrderDialog({
  order,
  label,
  title,
  saveLabel,
  cancelLabel,
  emptyLabel,
  successMessage,
  errorMessage,
}: {
  order: any;
  label: string;
  title: string;
  saveLabel: string;
  cancelLabel: string;
  emptyLabel: string;
  successMessage: string;
  errorMessage: string;
}) {
  const infos: Info[] = Array.isArray(order?.requiredUserInfo) ? order.requiredUserInfo : [];
  const editable = infos
    .map((info, index) => ({ info, index }))
    .filter(({ info }) => isEditable(info));

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleOpen = () => {
    const initial: Record<number, string> = {};
    editable.forEach(({ info, index }) => {
      initial[index] = String(info.value ?? "");
    });
    setValues(initial);
    setOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOrderInfo(
        String(order._id),
        editable.map(({ index }) => ({ index, value: values[index] ?? "" }))
      );
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
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpen} title={label}>
        <Pencil className="h-4 w-4" />
        <span className="sr-only">{label}</span>
      </Button>
      <Dialog open={open} onOpenChange={(v) => !isSaving && setOpen(v)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {editable.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            <div className="space-y-3">
              {editable.map(({ info, index }) => (
                <div key={index} className="space-y-1">
                  <label className="text-sm font-medium">{info.label || info.field}</label>
                  <Input
                    value={values[index] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [index]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              {cancelLabel}
            </Button>
            {editable.length > 0 && (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "..." : saveLabel}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
