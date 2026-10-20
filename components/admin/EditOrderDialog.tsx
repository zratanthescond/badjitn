"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { updateOrderInfo, updateOrderPlans } from "@/lib/actions/order.actions";
import { useToast } from "@/hooks/use-toast";

type Info = { label?: string; field?: string; type?: string; value?: string };
type Plan = { name: string; option: string; price: string };

// Work-submission answers are long free text edited elsewhere; files can't be typed.
const isEditable = (info: Info) =>
  !String(info.field || "").startsWith("work") && info.type !== "file";

const sumOf = (plans: Plan[]) => plans.reduce((acc, p) => acc + (Number(p.price) || 0), 0);

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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [total, setTotal] = useState("");
  const [totalTouched, setTotalTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleOpen = () => {
    const initial: Record<number, string> = {};
    editable.forEach(({ info, index }) => {
      initial[index] = String(info.value ?? "");
    });
    setValues(initial);
    setPlans(
      (Array.isArray(order?.details) ? order.details : []).map((d: any) => ({
        name: String(d?.name ?? ""),
        option: String(d?.option ?? ""),
        price: String(d?.price ?? ""),
      }))
    );
    setTotal(String(order?.totalAmount ?? ""));
    setTotalTouched(false);
    setOpen(true);
  };

  // The total follows the sum of the lines until the admin sets it by hand.
  const applyPlans = (next: Plan[]) => {
    setPlans(next);
    if (!totalTouched) setTotal(String(sumOf(next)));
  };
  const updatePlan = (i: number, patch: Partial<Plan>) =>
    applyPlans(plans.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const addPlan = () => applyPlans([...plans, { name: "", option: "", price: "0" }]);
  const removePlan = (i: number) => applyPlans(plans.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editable.length > 0) {
        await updateOrderInfo(
          String(order._id),
          editable.map(({ index }) => ({ index, value: values[index] ?? "" }))
        );
      }
      await updateOrderPlans(
        String(order._id),
        plans,
        total.trim() === "" ? undefined : Number(total)
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

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Plans</h3>
              <Button type="button" variant="outline" size="sm" onClick={addPlan}>
                <Plus className="mr-1 h-4 w-4" />
                Ajouter un plan
              </Button>
            </div>
            {plans.length === 0 && <p className="text-sm text-muted-foreground">Aucun plan.</p>}
            {plans.map((plan, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Plan (ex. Nuitée du 22 octobre)"
                    value={plan.name}
                    onChange={(e) => updatePlan(i, { name: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlan(i)}
                    title="Supprimer ce plan"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-[1fr_7rem] gap-2">
                  <Input
                    placeholder="Option (ex. Chambre double)"
                    value={plan.option}
                    onChange={(e) => updatePlan(i, { option: e.target.value })}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Prix"
                    value={plan.price}
                    onChange={(e) => updatePlan(i, { price: e.target.value })}
                  />
                </div>
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-sm font-medium">Total</label>
              <Input
                type="number"
                min="0"
                step="any"
                value={total}
                onChange={(e) => {
                  setTotalTouched(true);
                  setTotal(e.target.value);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Somme des plans : {sumOf(plans)}. Le total suit la somme tant que vous ne le modifiez pas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              {cancelLabel}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "..." : saveLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
