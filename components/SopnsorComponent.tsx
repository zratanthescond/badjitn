"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  CalendarIcon,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  Clock,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { format, addDays, differenceInDays } from "date-fns";
import { ar, fr, enUS } from "date-fns/locale";
import type { Event } from "@/types";

interface PromotionPlan {
  id: string;
  name: string;
  duration: number; // days
  price: number;
  features: string[];
  popular?: boolean;
}

interface EventPromotionProps {
  event: Event;
}

const promotionPlans: PromotionPlan[] = [
  {
    id: "basic",
    name: "Basic Boost",
    duration: 7,
    price: 29,
    features: [
      "Featured in search",
      "Email newsletter inclusion",
      "Basic analytics",
    ],
  },
  {
    id: "premium",
    name: "Premium Promotion",
    duration: 14,
    price: 79,
    features: [
      "Top search placement",
      "Social media promotion",
      "Advanced analytics",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "ultimate",
    name: "Ultimate Campaign",
    duration: 30,
    price: 149,
    features: [
      "Homepage featured",
      "Influencer outreach",
      "Custom marketing materials",
      "Dedicated account manager",
    ],
  },
];

const EventPromotion: React.FC<EventPromotionProps> = ({ event }) => {
  const t = useTranslations("eventPromotion");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isPromoting, setIsPromoting] = useState(false);

  // Get locale for date-fns
  const dateLocale = locale === "ar" ? ar : locale === "fr" ? fr : enUS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !selectedPlan) {
      setMessage(t("messages.fillAllFields"));
      setMessageType("error");
      return;
    }

    if (endDate <= startDate) {
      setMessage(t("messages.invalidDateRange"));
      setMessageType("error");
      return;
    }

    setIsPromoting(true);

    // Simulate promotion process
    setTimeout(() => {
      setMessage(t("messages.success"));
      setMessageType("success");
      setIsPromoting(false);
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedPlan("");
    }, 2000);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = promotionPlans.find((p) => p.id === planId);
    if (plan && startDate) {
      setEndDate(addDays(startDate, plan.duration));
    }
  };

  const selectedPlanData = promotionPlans.find((p) => p.id === selectedPlan);
  const promotionDays =
    startDate && endDate ? differenceInDays(endDate, startDate) : 0;

  return event && event._id ? (
    <div className={`w-full max-w-4xl mx-auto ${isRTL ? "rtl" : "ltr"}`}>
      <Card className="glass backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/20 shadow-xl">
        <CardHeader className="space-y-4">
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <CardTitle
                className={`text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("title")}
              </CardTitle>
              <p
                className={`text-muted-foreground mt-1 ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("subtitle")}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Event Info */}
          <Card className="glass bg-white/5 border border-white/10">
            <CardContent className="p-6">
              <div
                className={`flex items-center gap-4 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-blue-400" />
                </div>
                <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                  <h3
                    className={`text-xl font-bold ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {event.title}
                  </h3>
                  <p
                    className={`text-muted-foreground ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {format(new Date(event.startDateTime), "PPP", {
                      locale: dateLocale,
                    })}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-400"
                >
                  {t("eventStatus.active")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Promotion Plans */}
          <div className="space-y-4">
            <h3
              className={`text-xl font-semibold ${
                isRTL ? "font-arabic text-right" : ""
              }`}
            >
              {t("choosePlan")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promotionPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedPlan === plan.id
                      ? "glass bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50 shadow-lg shadow-purple-500/25"
                      : "glass bg-white/5 border-white/10 hover:bg-white/10"
                  } ${plan.popular ? "ring-2 ring-purple-400/50" : ""}`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {t("popular")}
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6 space-y-4">
                    <div
                      className={`text-center ${isRTL ? "font-arabic" : ""}`}
                    >
                      <h4 className="text-lg font-bold">
                        {t(`plans.${plan.id}.name`)}
                      </h4>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <span className="text-3xl font-bold">
                          ${plan.price}
                        </span>
                        <span className="text-muted-foreground">
                          /{t("duration.days", { count: plan.duration })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span
                            className={`text-sm ${
                              isRTL ? "font-arabic text-right" : ""
                            }`}
                          >
                            {t(`plans.${plan.id}.features.${index}`)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {selectedPlan === plan.id && (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-purple-400" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-3">
              <Label
                className={`text-sm font-medium ${isRTL ? "font-arabic" : ""}`}
              >
                {t("startDate")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start glass bg-white/10 border-white/20 hover:bg-white/15 ${
                      isRTL ? "flex-row-reverse font-arabic" : ""
                    }`}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP", { locale: dateLocale })
                    ) : (
                      <span className={isRTL ? "font-arabic" : ""}>
                        {t("selectStartDate")}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 glass bg-black/90 border-white/20"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-3">
              <Label
                className={`text-sm font-medium ${isRTL ? "font-arabic" : ""}`}
              >
                {t("endDate")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start glass bg-white/10 border-white/20 hover:bg-white/15 ${
                      isRTL ? "flex-row-reverse font-arabic" : ""
                    }`}
                    disabled={!startDate}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP", { locale: dateLocale })
                    ) : (
                      <span className={isRTL ? "font-arabic" : ""}>
                        {t("selectEndDate")}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 glass bg-black/90 border-white/20"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => !startDate || date <= startDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Promotion Summary */}
          {selectedPlanData && startDate && endDate && (
            <Card className="glass bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
              <CardContent className="p-6">
                <div
                  className={`flex items-center gap-3 mb-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Target className="h-6 w-6 text-green-400" />
                  <h4
                    className={`text-lg font-semibold text-green-400 ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("promotionSummary")}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`text-center ${isRTL ? "font-arabic" : ""}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-muted-foreground">
                        {t("duration.label")}
                      </span>
                    </div>
                    <p className="text-xl font-bold">
                      {promotionDays}{" "}
                      {t("duration.days", { count: promotionDays })}
                    </p>
                  </div>

                  <div className={`text-center ${isRTL ? "font-arabic" : ""}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-muted-foreground">
                        {t("plan")}
                      </span>
                    </div>
                    <p className="text-xl font-bold">
                      {t(`plans.${selectedPlanData.id}.name`)}
                    </p>
                  </div>

                  <div className={`text-center ${isRTL ? "font-arabic" : ""}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-muted-foreground">
                        {t("totalCost")}
                      </span>
                    </div>
                    <p className="text-xl font-bold">
                      ${selectedPlanData.price}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Display */}
          {message && (
            <Alert
              className={`${
                messageType === "success"
                  ? "border-green-500/20 bg-green-500/10"
                  : "border-red-500/20 bg-red-500/10"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription
                className={`${
                  messageType === "success" ? "text-green-700" : "text-red-700"
                } ${isRTL ? "font-arabic" : ""}`}
              >
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-lg transition-all duration-200 transform hover:scale-105 ${
              isRTL ? "font-arabic" : ""
            }`}
            disabled={isPromoting || !startDate || !endDate || !selectedPlan}
            size="lg"
          >
            {isPromoting ? (
              <div
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("promoting")}
              </div>
            ) : (
              <div
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                {t("promoteEvent")}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  ) : (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Alert className="bg-red-500/10 border-red-500/20">
        <AlertDescription className="text-red-700">
          {t("eventNotFound")}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EventPromotion;
