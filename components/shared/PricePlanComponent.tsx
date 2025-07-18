"use client";

import { Plus, Trash2, ArrowLeft, Package } from "lucide-react";
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
}

interface PricePlanComponentProps {
  pricePlan: PricePlan[];
  setPricePlan: React.Dispatch<React.SetStateAction<PricePlan[]>>;
  setIsPricePlan: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PricePlanComponent({
  pricePlan,
  setPricePlan,
  setIsPricePlan,
}: PricePlanComponentProps) {
  const t = useTranslations("pricePlan");

  const [planDescription, setPlanDescription] = useState<string>("");
  const [planPrice, setPlanPrice] = useState<string>("");
  const [planPlaces, setPlanPlaces] = useState<string>("");
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
    const newErrors = { description: "", price: "", places: "" };
    let isValid = true;

    if (planDescription.trim().length < 10) {
      newErrors.description = t("form.errors.descriptionRequired");
      isValid = false;
    }

    const priceNum = Number.parseFloat(planPrice);
    if (!planPrice || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = t("form.errors.priceRequired");
      isValid = false;
    }

    const placesNum = Number.parseInt(planPlaces);
    if (!planPlaces || isNaN(placesNum) || placesNum <= 0) {
      newErrors.places = t("form.errors.placesRequired");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newPlan: PricePlan = {
      name: planDescription.trim(),
      price: Number.parseFloat(planPrice),
      places: Number.parseInt(planPlaces),
    };

    setPricePlan([...pricePlan, newPlan]);
    setPlanDescription("");
    setPlanPrice("");
    setPlanPlaces("");
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
        <form onSubmit={handleAddPlan} className="space-y-6 mb-8">
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
                className={`mt-1 rounded-full ${
                  errors.description ? "border-destructive" : ""
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
                {t("form.labels.price")}
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder={t("form.placeholders.price")}
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
                className={`mt-1 rounded-full ${
                  errors.price ? "border-destructive" : ""
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
                min="1"
                placeholder={t("form.placeholders.places")}
                value={planPlaces}
                onChange={(e) => setPlanPlaces(e.target.value)}
                className={`mt-1 rounded-full ${
                  errors.places ? "border-destructive" : ""
                }`}
              />
              {errors.places && (
                <p className="text-sm text-destructive mt-1">{errors.places}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            {t("buttons.addPlan")}
          </Button>
        </form>

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
                    </CardContent>

                    <CardFooter className="pt-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="font-semibold rounded-full"
                        >
                          {plan.price} {t("list.currency")}
                        </Badge>
                        {plan.places && (
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
