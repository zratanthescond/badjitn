"use client";

import { Plus, Trash2, ArrowLeft, Package, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

// Type definition
interface PricePlan {
  name: string;
  price: number;
  places?: number;
  note?: string;
  options?: string[];
}

interface PricePlanComponentProps {
  pricePlan: PricePlan[];
  setPricePlan: React.Dispatch<React.SetStateAction<PricePlan[]>>;
  setIsPricePlan: React.Dispatch<React.SetStateAction<boolean>>;
  currencyCode: string;
}

export default function PricePlanComponent({
  pricePlan,
  setPricePlan,
  setIsPricePlan,
  currencyCode,
}: PricePlanComponentProps) {
  const t = useTranslations("pricePlan");
  const priceLabel = t("form.labels.price").replace(/\s*\([^)]*\)\s*$/, "");

  const [planDescription, setPlanDescription] = useState<string>("");
  const [planPrice, setPlanPrice] = useState<string>("");
  const [planPlaces, setPlanPlaces] = useState<string>("");
  const [planNote, setPlanNote] = useState<string>("");
  const [planOptions, setPlanOptions] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState<string>("");

  const [errors, setErrors] = useState<{
    description: string;
    price: string;
    places: string;
  }>({
    description: "",
    price: "",
    places: "",
  });

  const validateForm = () => {
    return true;
  };

  const handleAddOption = () => {
    if (currentOption.trim()) {
      setPlanOptions([...planOptions, currentOption.trim()]);
      setCurrentOption("");
    }
  };

  const removeOption = (index: number) => {
    setPlanOptions(planOptions.filter((_, i) => i !== index));
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const newPlan: PricePlan = {
      name: planDescription.trim() || `${t("list.planNumber")} ${pricePlan.length + 1}`,
      price: Number.parseFloat(planPrice) || 0,
      places: planPlaces ? Number.parseInt(planPlaces) : undefined,
      note: planNote.trim(),
      options: planOptions.length > 0 ? planOptions : undefined,
    };

    setPricePlan([...pricePlan, newPlan]);
    setPlanDescription("");
    setPlanPrice("");
    setPlanPlaces("");
    setPlanNote("");
    setPlanOptions([]);
    setCurrentOption("");
    setErrors({ description: "", price: "", places: "" });
  };

  const removePlan = (index: number) => {
    setPricePlan((prevPlans) => prevPlans.filter((_, i) => i !== index));
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{t("emptyState.title")}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        {t("emptyState.description")}
      </p>
      <Button
        variant="outline"
        onClick={() => setIsPricePlan(false)}
        className="rounded-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("emptyState.action")}
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-gradient-to-br from-background to-muted/20 rounded-3xl">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t("title")}
            </CardTitle>
            <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsPricePlan(false)}
            className="shrink-0 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("buttons.simplePrice")}
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-6">
        {/* Add Plan Form */}
        <div className="space-y-6 mb-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium">
                {t("form.labels.planDescription")}
              </Label>
              <Input
                id="description"
                placeholder={t("form.placeholders.planDescription")}
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                className={`mt-1 rounded-full ${errors.description ? "border-destructive" : ""
                  }`}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="price" className="text-sm font-medium">
                {priceLabel} ({currencyCode})
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder={t("form.placeholders.price")}
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
                className={`mt-1 rounded-full ${errors.price ? "border-destructive" : ""
                  }`}
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <Label htmlFor="places" className="text-sm font-medium">
                {t("form.labels.availablePlaces")}
              </Label>
              <Input
                id="places"
                type="number"
                min="0"
                placeholder={t("form.placeholders.places")}
                value={planPlaces}
                onChange={(e) => setPlanPlaces(e.target.value)}
                className={`mt-1 rounded-full ${errors.places ? "border-destructive" : ""
                  }`}
              />
              {errors.places && (
                <p className="text-sm text-destructive mt-1">{errors.places}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="note" className="text-sm font-medium">
                {t("form.labels.note")}
              </Label>
              <Input
                id="note"
                placeholder={t("form.placeholders.note")}
                value={planNote}
                onChange={(e) => setPlanNote(e.target.value)}
                className="mt-1 rounded-full"
              />
            </div>

            {/* Choices Section */}
            <div className="md:col-span-2 space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ListTodo className="w-4 h-4" />
                Choix du plan (Optionnel - Sélection unique)
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Petit déjeuner, VIP, etc."
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  className="rounded-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleAddOption}
                  className="rounded-full"
                >
                  Ajouter
                </Button>
              </div>
              
              {planOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 p-3 bg-muted/30 rounded-2xl border border-dashed">
                  {planOptions.map((opt, idx) => (
                    <Badge key={idx} variant="outline" className="pl-3 pr-1 py-1 rounded-full flex items-center gap-1 bg-background">
                      {opt}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(idx)}
                        className="h-5 w-5 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            type="button"
            className="w-full sm:w-auto rounded-full"
            onClick={handleAddPlan}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("buttons.addPlan")}{" "}
          </Button>
        </div>

        <Separator className="mb-6" />

        {/* Plans List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("list.title")} ({pricePlan.length})
          </h3>

          <ScrollArea className="h-[400px] rounded-3xl border bg-muted/20 p-4">
            {pricePlan.length > 0 ? (
              <div className="space-y-4">
                {pricePlan.map((plan, index) => (
                  <Card
                    key={index}
                    className="bg-background/80 backdrop-blur-sm border shadow-sm hover:shadow-md transition-shadow rounded-3xl"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="text-xs rounded-full"
                        >
                          {t("list.planNumber")}
                          {index + 1}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePlan(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                          title={t("actions.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 pb-3">
                      <p className="font-medium text-sm leading-relaxed">
                        {plan.name}
                      </p>
                      {plan.note && (
                        <p className="text-muted-foreground text-xs mt-2 italic">
                          {plan.note}
                        </p>
                      )}
                      
                      {plan.options && plan.options.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {plan.options.map((opt, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] py-0 rounded-full opacity-70">
                              {opt}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="font-semibold rounded-full"
                        >
                          {plan.price} {currencyCode}
                        </Badge>
                        {plan.places !== undefined && (
                          <Badge
                            variant="secondary"
                            className="text-xs rounded-full"
                          >
                            {plan.places} {t("list.places")}
                          </Badge>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
            <ScrollBar />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
