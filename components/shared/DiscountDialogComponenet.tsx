"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Percent, Tag, Sparkles, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface Field {
  id: string;
  name: string;
  type?: "select" | "text" | "number" | "radio";
  options?: string[];
}

interface DiscountDialogProps {
  form: {
    control: any;
    getValues: (name: string) => any;
  };
  fields: Field[];
}

type DiscountType = "percentage" | "fixed";
type DiscountTarget = "all" | "inscription" | "plan";

const DiscountDialog: React.FC<DiscountDialogProps> = ({ form, fields }) => {
  const t = useTranslations("discount");
  const [fieldSelected, setFieldSelected] = React.useState<Field | null>(null);

  const percentageOptions = Array.from({ length: 9 }, (_, i) => ({
    value: `${(i + 1) * 10}`,
    label: `${(i + 1) * 10}%`,
  }));

  const getSingleField = (fieldId: string) => {
    const found = fields.find((f) => f.id === fieldId);
    setFieldSelected(found || null);
  };

  return (
    <div className="flex flex-col">
      <FormField
        control={form.control}
        name="discount"
        render={({ field }) => {
          const discountType: DiscountType = field.value?.discountType ?? "percentage";
          const discountTarget: DiscountTarget = field.value?.discountTarget ?? "all";
          const pricePlans: any[] = form.getValues("pricePlan") || [];

          return (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-[2px] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25"
                >
                  <div className="flex items-center gap-2 rounded-2xl px-6 py-3 text-gray-900 transition-all duration-300 group-hover:bg-transparent group-hover:text-white">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">{t("applyDiscount")}</span>
                    <Sparkles className="h-4 w-4 opacity-70" />
                  </div>
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl">
                <DialogHeader className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 flex items-center justify-center">
                    <Percent className="h-6 w-6 text-white" />
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">
                    {t("title")}
                  </DialogTitle>
                  <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                  <FormItem>
                    <FormControl>
                      <div className="space-y-5">

                        {/* Field Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t("selectField")}</label>
                          {fields.length > 0 ? (
                            <Select
                              onValueChange={(value) => {
                                field.onChange({ ...field.value, field: value });
                                getSingleField(value);
                              }}
                              value={field.value?.field}
                            >
                              <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 hover:border-pink-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20">
                                <SelectValue placeholder={t("selectFieldPlaceholder")} />
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-0 bg-card/95 backdrop-blur-xl shadow-xl">
                                {fields.map((f) => (
                                  <SelectItem key={f.id} value={f.id} className="rounded-lg hover:bg-pink-50 focus:bg-pink-50">
                                    {f.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="h-12 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center text-gray-500 text-sm">
                              {t("noFieldsAvailable")}
                            </div>
                          )}
                        </div>

                        {/* Field Value */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t("fieldValue")}</label>
                          {field.value?.field ? (
                            fieldSelected?.type === "select" || fieldSelected?.type === "radio" ? (
                              <Select
                                onValueChange={(value) => field.onChange({ ...field.value, value })}
                                value={field.value?.value}
                              >
                                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm">
                                  <SelectValue placeholder={t("selectValue")} />
                                  <ChevronDown className="h-4 w-4 opacity-50" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-0 bg-card/95 backdrop-blur-xl shadow-xl">
                                  {fieldSelected?.options?.map((opt) => (
                                    <SelectItem key={opt} value={opt} className="rounded-lg hover:bg-indigo-50 focus:bg-indigo-50">
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                onChange={(e) => field.onChange({ ...field.value, value: e.target.value })}
                                value={field.value?.value || ""}
                                placeholder={t("enterValue")}
                                className="h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm"
                              />
                            )
                          ) : (
                            <div className="h-12 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center text-gray-500 text-sm">
                              {t("selectFieldFirst")}
                            </div>
                          )}
                        </div>

                        <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                        {/* Discount Type toggle */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t("discountType")}</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(["percentage", "fixed"] as DiscountType[]).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => field.onChange({ ...field.value, discountType: type, discount: "" })}
                                className={`h-10 rounded-xl border-2 text-sm font-medium transition-all ${
                                  discountType === type
                                    ? "border-pink-500 bg-pink-50 text-pink-700"
                                    : "border-gray-200 bg-white/50 text-gray-600 hover:border-pink-300"
                                }`}
                              >
                                {t(type)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Discount Amount */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t("discountAmount")}
                            {discountType === "percentage" ? " (%)" : ""}
                          </label>
                          {discountType === "percentage" ? (
                            <Select
                              onValueChange={(value) => field.onChange({ ...field.value, discount: value })}
                              value={field.value?.discount || ""}
                            >
                              <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
                                <SelectValue placeholder={t("selectDiscountPlaceholder")} />
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-0 bg-card/95 backdrop-blur-xl shadow-xl">
                                {percentageOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="rounded-lg hover:bg-green-50 focus:bg-green-50">
                                    <div className="flex items-center gap-2">
                                      <Percent className="h-3 w-3 text-green-600" />
                                      {opt.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type="number"
                              min="0"
                              onChange={(e) => field.onChange({ ...field.value, discount: e.target.value })}
                              value={field.value?.discount || ""}
                              placeholder={t("discountAmountPlaceholder")}
                              className="h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm hover:border-green-300 focus:border-green-500"
                            />
                          )}
                        </div>

                        {/* Discount Target */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t("discountTarget")}</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["all", "inscription", "plan"] as DiscountTarget[]).map((target) => (
                              <button
                                key={target}
                                type="button"
                                onClick={() => field.onChange({ ...field.value, discountTarget: target, discountPlanId: undefined })}
                                className={`h-10 rounded-xl border-2 text-xs font-medium transition-all ${
                                  discountTarget === target
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-gray-200 bg-white/50 text-gray-600 hover:border-indigo-300"
                                }`}
                              >
                                {t(`target${target.charAt(0).toUpperCase()}${target.slice(1)}` as any)}
                              </button>
                            ))}
                          </div>

                          {/* Plan selector (only when target === "plan") */}
                          {discountTarget === "plan" && (
                            <div className="mt-2">
                              {pricePlans.length > 0 ? (
                                <Select
                                  onValueChange={(value) => field.onChange({ ...field.value, discountPlanId: value })}
                                  value={field.value?.discountPlanId}
                                >
                                  <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm hover:border-indigo-300">
                                    <SelectValue placeholder={t("selectPlan")} />
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl border-0 bg-card/95 backdrop-blur-xl shadow-xl">
                                    {pricePlans.map((plan: any, idx: number) => (
                                      <SelectItem key={plan._id || idx} value={plan._id || String(idx)} className="rounded-lg hover:bg-indigo-50 focus:bg-indigo-50">
                                        {plan.name} — {plan.price}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="h-12 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center text-gray-500 text-sm">
                                  {t("noPlansConfigured")}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>

                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-12 rounded-xl border-0 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t("saveChanges")}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          );
        }}
      />
    </div>
  );
};

export default DiscountDialog;
