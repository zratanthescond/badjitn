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
  FormDescription,
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
import { Badge } from "@/components/ui/badge";
import { Percent, Tag, Sparkles, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface Field {
  id: string;
  name: string;
  type: "select" | "text" | "number";
  options?: string[];
}

interface DiscountValue {
  field?: string;
  value?: string;
  discount?: string;
}

interface DiscountDialogProps {
  form: {
    control: any;
    getValues: (name: string) => any;
  };
  fields: Field[];
  onFieldSelect?: (fieldId: string) => Promise<Field>;
}

const DiscountDialog: React.FC<DiscountDialogProps> = ({
  form,
  fields,
  onFieldSelect,
}) => {
  const t = useTranslations("discount");
  const [fieldSelected, setFieldSelected] = React.useState<Field | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const getSingleField = async (fieldId: string) => {
    if (!onFieldSelect) {
      const field = fields.find((f) => f.id === fieldId);
      setFieldSelected(field || null);
      return;
    }

    setIsLoading(true);
    try {
      const field = await onFieldSelect(fieldId);
      setFieldSelected(field);
    } catch (error) {
      console.error("Error fetching field:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const discountOptions = Array.from({ length: 9 }, (_, i) => ({
    value: `${(i + 1) * 10}`,
    label: `${(i + 1) * 10}%`,
  }));

  return (
    <div className="flex flex-col">
      <FormField
        control={form.control}
        name="discount"
        render={({ field }) => (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-[2px] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25"
              >
                <div className="flex items-center gap-2 rounded-2xl  px-6 py-3 text-gray-900 transition-all duration-300 group-hover:bg-transparent group-hover:text-white">
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
                <DialogDescription className="">
                  {t("description")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <FormItem>
                  <FormDescription className="text-center text-sm font-medium ">
                    {t("chooseFieldAndValue")}
                  </FormDescription>

                  <FormControl>
                    {form.getValues("requiredInfo")?.length > 0 ? (
                      <div className="space-y-6">
                        {/* Field Selection */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium ">
                                {t("selectField")}
                              </label>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange({
                                    ...field.value,
                                    field: value,
                                  });
                                  getSingleField(value);
                                }}
                                value={field.value?.field}
                              >
                                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 hover:border-pink-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20">
                                  <SelectValue
                                    placeholder={t("selectFieldPlaceholder")}
                                  />
                                  <ChevronDown className="h-4 w-4 opacity-50" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-0 bg-card/95 backdrop-blur-xl shadow-xl">
                                  {form
                                    .getValues("requiredInfo")
                                    .map((fieldId: string) => {
                                      const fieldData = fields.find(
                                        (f) => f.id === fieldId
                                      );
                                      return (
                                        <SelectItem
                                          key={fieldId}
                                          value={fieldId}
                                          className="rounded-lg hover:bg-pink-50 focus:bg-pink-50"
                                        >
                                          {fieldData?.name ?? (
                                            <span className="flex items-center gap-2">
                                              {fieldId}
                                              <Badge
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {t("fieldNotFound")}
                                              </Badge>
                                            </span>
                                          )}
                                        </SelectItem>
                                      );
                                    })}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Value Selection */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium ">
                                {t("fieldValue")}
                              </label>
                              {field.value?.field ? (
                                <>
                                  {fieldSelected?.type === "select" ? (
                                    <Select
                                      onValueChange={(value) => {
                                        field.onChange({
                                          ...field.value,
                                          value,
                                        });
                                      }}
                                      value={field.value?.value}
                                      disabled={isLoading}
                                    >
                                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                                        <SelectValue
                                          placeholder={t("selectValue")}
                                        />
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-xl border-0 bg-card/95 backdrop-blur-xl shadow-xl">
                                        {fieldSelected?.options?.map(
                                          (option: string) => (
                                            <SelectItem
                                              key={option}
                                              value={option}
                                              className="rounded-lg hover:bg-indigo-50 focus:bg-indigo-50"
                                            >
                                              {option}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      onChange={(e) =>
                                        field.onChange({
                                          ...field.value,
                                          value: e.target.value,
                                        })
                                      }
                                      value={field.value?.value || ""}
                                      placeholder={t("enterValue")}
                                      className="h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                      disabled={isLoading}
                                    />
                                  )}
                                </>
                              ) : (
                                <div className="h-12 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center text-gray-500 text-sm">
                                  {t("selectFieldFirst")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                        {/* Discount Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium ">
                            {t("selectDiscountPercentage")}
                          </label>
                          <Select
                            onValueChange={(value) => {
                              field.onChange({
                                ...field.value,
                                discount: value,
                              });
                            }}
                            value={field.value?.discount || "0"}
                          >
                            <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
                              <SelectValue
                                placeholder={t("selectDiscountPlaceholder")}
                              />
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-0 bg-/95 backdrop-blur-xl shadow-xl">
                              {discountOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="rounded-lg hover:bg-green-50 focus:bg-green-50"
                                >
                                  <div className="flex items-center gap-2">
                                    <Percent className="h-3 w-3 text-green-600" />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center text-gray-500 space-y-2">
                        <Tag className="h-8 w-8 opacity-50" />
                        <p className="text-sm font-medium">
                          {t("noRequiredInfoSelected")}
                        </p>
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>

              <DialogFooter className="pt-6">
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
        )}
      />
    </div>
  );
};

export default DiscountDialog;
