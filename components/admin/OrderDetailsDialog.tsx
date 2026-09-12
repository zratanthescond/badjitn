"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Eye,
  ClipboardCheck,
  User,
  Tag,
  CreditCard,
  Gift,
  FileText,
  ShieldCheck,
  ShieldX,
  Clock,
} from "lucide-react";
import { updateOrderEligibility } from "@/lib/actions/order.actions";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialogTrigger,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useTranslations, useLocale } from "next-intl";
import { formatPriceByCountry } from "@/lib/utils";

const OrderDetailsDialog = ({ value }: { value: any }) => {
  const t = useTranslations("orderDetailsDialog");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState<"approved" | "rejected" | null>(null);

  // Safe translation with fallback (avoids MISSING_MESSAGE crashes for new keys)
  const tx = (key: string, fallback: string) =>
    t.has(key as any) ? t(key as any) : fallback;

  // A discount was actually applied to this registration.
  const discountApplied =
    !!value?.discountInfo && Number(value?.discountInfo?.value) > 0;
  // Whether the event configured a justificatif requirement for its discount.
  const requiresProof = value?.discountRequireProof === true;
  // Show the eligibility-review section when a status was stored, or when a
  // discount was applied to an event that requires a justificatif (covers
  // registrations created before eligibility tracking existed).
  const showEligibility =
    !!value?.eligibilityStatus || (discountApplied && requiresProof);
  // Effective status: stored one, or "pending" when review is needed but none set.
  const eligibilityStatus: "pending" | "approved" | "rejected" | undefined =
    value?.eligibilityStatus || (showEligibility ? "pending" : undefined);

  const handleEligibility = async (status: "approved" | "rejected") => {
    try {
      setIsUpdating(status);
      await updateOrderEligibility({ orderId: value._id, status });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title:
          status === "approved"
            ? tx("eligibility.approvedToast", "Remise validée")
            : tx("eligibility.rejectedToast", "Remise refusée"),
      });
    } catch (error) {
      toast({
        title: tx("eligibility.errorToast", "Une erreur est survenue"),
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const totalAmount =
    Number.parseFloat(value?.totalAmount) === 0
      ? (value.details &&
          value.details.length > 0 &&
          value?.details?.reduce(
            (sum: number, item: any) => sum + Number.parseFloat(item.price),
            0
          )) ||
        0
      : Number.parseFloat(value.totalAmount);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full ${isRTL ? "font-arabic" : ""}`}
        >
          <Eye className="h-4 w-4 mr-1" />
          {t("viewButton")}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent
        className={`max-w-2xl max-h-[90vh] rounded-2xl border border-border bg-card ${
          isRTL ? "rtl" : "ltr"
        }`}
      >
        <AlertDialogHeader className="space-y-3">
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="p-2 rounded-xl bg-admin-accent-soft">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle
              className={`text-2xl font-bold text-foreground ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("title")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription
            className={`text-muted-foreground ${
              isRTL ? "font-arabic text-right" : ""
            }`}
          >
            {t("description")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="max-h-96 pr-4">
          <div className="flex flex-col gap-6">
            {/* Discount Eligibility Section */}
            {showEligibility && (
              <Card className="border border-admin-warning/25 bg-admin-warning-soft/50">
                <CardHeader className="pb-3">
                  <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="p-2 rounded-lg bg-admin-warning-soft">
                      <ShieldCheck className="h-5 w-5 text-admin-warning" />
                    </div>
                    <div className={isRTL ? "text-right" : ""}>
                      <CardTitle className={`text-lg text-foreground ${isRTL ? "font-arabic" : ""}`}>
                        {tx("eligibility.title", "Éligibilité à la remise")}
                      </CardTitle>
                      <CardDescription className={isRTL ? "font-arabic" : ""}>
                        {tx("eligibility.description", "Vérifiez le justificatif avant de valider la remise.")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Current status */}
                  <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {eligibilityStatus === "pending" && (
                      <Badge className="bg-admin-warning-soft border-admin-warning/40 text-admin-warning font-semibold">
                        <Clock className="h-3 w-3 mr-1" />
                        {tx("eligibility.statusPending", "En attente de validation")}
                      </Badge>
                    )}
                    {eligibilityStatus === "approved" && (
                      <Badge className="bg-admin-success-soft border-admin-success/40 text-admin-success font-semibold">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {tx("eligibility.statusApproved", "Remise validée")}
                      </Badge>
                    )}
                    {eligibilityStatus === "rejected" && (
                      <Badge className="bg-admin-critical-soft border-destructive/40 text-destructive font-semibold">
                        <ShieldX className="h-3 w-3 mr-1" />
                        {tx("eligibility.statusRejected", "Remise refusée — tarif plein")}
                      </Badge>
                    )}
                  </div>

                  {/* Proof document */}
                  {value?.discountProofUrl ? (
                    <a
                      href={value.discountProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl border border-admin-warning/30 bg-card text-admin-warning font-medium hover:bg-muted/60 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      {tx("eligibility.viewProof", "Voir le justificatif")}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {tx("eligibility.noProof", "Aucun justificatif fourni par le participant.")}
                    </p>
                  )}

                  {/* Actions (only while pending) */}
                  {eligibilityStatus === "pending" && (
                    <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Button
                        onClick={() => handleEligibility("approved")}
                        disabled={isUpdating !== null}
                        className="flex-1 rounded-full"
                      >
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        {isUpdating === "approved"
                          ? tx("eligibility.processing", "Traitement...")
                          : tx("eligibility.approve", "Valider la remise")}
                      </Button>
                      <Button
                        onClick={() => handleEligibility("rejected")}
                        disabled={isUpdating !== null}
                        variant="outline"
                        className="flex-1 rounded-full border-destructive/40 text-destructive hover:bg-admin-critical-soft"
                      >
                        <ShieldX className="h-4 w-4 mr-1" />
                        {isUpdating === "rejected"
                          ? tx("eligibility.processing", "Traitement...")
                          : tx("eligibility.reject", "Refuser (tarif plein)")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Order Plans Section */}
            <Card className="border border-border bg-muted/40">
              <CardHeader className="pb-4">
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-admin-success-soft">
                    <Tag className="h-5 w-5 text-admin-success" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle
                      className={`text-lg text-foreground ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("orderPlans.title")}
                    </CardTitle>
                    <CardDescription className={isRTL ? "font-arabic" : ""}>
                      {t("orderPlans.description")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {value?.details && value.details.length > 0 ? (
                  value?.details?.map((detail: any, index: number) => (
                    <div
                      key={detail._id || index}
                      className={`flex justify-between items-center p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-1 rounded-full bg-admin-success-soft">
                          <Check className="h-4 w-4 text-admin-success" />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`font-medium ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {typeof detail.name === "string"
                              ? detail.name
                              : detail.name?.name || ""}
                          </span>
                          {detail.option && typeof detail.option !== "object" && (
                            <span className="text-xs font-semibold text-primary/70 mt-0.5">
                              {detail.option}
                            </span>
                          )}
                          {detail.option && typeof detail.option === "object" && (
                            <span className="text-xs font-semibold text-primary/70 mt-0.5">
                              {detail.option.name || ""}
                            </span>
                          )}
                        </div>
                      </div>
                      {Number.parseFloat(detail.price) > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-admin-success-soft border-admin-success/30 text-admin-success font-semibold"
                        >
                          {formatPriceByCountry(detail.price, value?.eventCountry, locale)}
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl border border-border bg-card ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="p-1 rounded-full bg-admin-success-soft">
                      <Check className="h-4 w-4 text-admin-success" />
                    </div>
                    <span
                      className={`font-medium ${isRTL ? "font-arabic" : ""}`}
                    >
                      {t("orderPlans.allPlansAvailable")}
                    </span>
                  </div>
                )}
              </CardContent>

              {(totalAmount > 0 || value?.type === "hosted") && (
                <CardFooter className="pt-4">
                  {value?.type !== "hosted" ? (
                    <div className="w-full space-y-4">
                      <Separator />

                      <div
                        className={`flex justify-between items-center ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <CreditCard className="h-5 w-5 text-admin-success" />
                          <span
                            className={`font-semibold text-foreground ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("payment.totalAmount")}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-admin-success-soft border-admin-success/40 text-admin-success text-lg font-bold px-4 py-2"
                        >
                          {formatPriceByCountry(totalAmount, value?.eventCountry, locale)}
                        </Badge>
                      </div>

                      {value?.discountInfo && (
                        <div className="space-y-2">
                          <div
                            className={`flex flex-wrap gap-2 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                          >
                            <Badge className="bg-primary text-primary-foreground border-0 font-semibold">
                              <Gift className="h-3 w-3 mr-1" />
                              {t("discount.label")}: {value.discountInfo.value}%
                            </Badge>
                            <Badge variant="outline" className="border-border font-semibold">
                              {value.type === "paid"
                                ? t("payment.cashPaid")
                                : t("payment.toPay")}
                              : {formatPriceByCountry(
                                (totalAmount / 100) * value.discountInfo.value,
                                value?.eventCountry,
                                locale
                              )}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-admin-accent-soft w-full ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="p-2 rounded-full bg-admin-accent-soft">
                        <Gift className="h-5 w-5 text-primary" />
                      </div>
                      <span
                        className={`font-medium text-admin-accent-soft-foreground ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("payment.hostedByAdmin")}
                      </span>
                    </div>
                  )}
                </CardFooter>
              )}
            </Card>

            {/* Buyer Information Section */}
            {value?.requiredUserInfo && value.requiredUserInfo.length > 0 && (
              <Card className="border border-border bg-muted/40">
                <CardHeader className="pb-4">
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-admin-accent-soft">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className={isRTL ? "text-right" : ""}>
                      <CardTitle
                        className={`text-lg text-foreground ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("buyerInfo.title")}
                      </CardTitle>
                      <CardDescription className={isRTL ? "font-arabic" : ""}>
                        {t("buyerInfo.description")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {value.requiredUserInfo.map((info: any, index: number) => {
                    const renderableLabel =
                      typeof info?.label === "string" || typeof info?.label === "number"
                        ? info.label
                        : info?.label?.name || "";
                    const renderableValue =
                      typeof info?.value === "string" || typeof info?.value === "number"
                        ? info.value
                        : info?.value?.name || "";
                    return (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          {renderableLabel}:
                        </span>
                        {info.label === value.discountInfo?.label && (
                          <Badge
                            variant="outline"
                            className="bg-admin-accent-soft border-primary/30 text-admin-accent-soft-foreground text-xs"
                          >
                            {t("discount.eligible")}
                          </Badge>
                        )}
                      </div>

                      {info.value === value?.discountInfo?.fieldValue ? (
                        <div
                          className={`flex items-center gap-2 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Badge className="bg-primary text-primary-foreground border-0 font-semibold">
                            {renderableValue}
                          </Badge>
                          <Badge variant="outline" className="border-border">
                            {value.discountInfo.value}%
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          {renderableValue}
                        </Badge>
                      )}
                    </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel className={`rounded-full ${isRTL ? "font-arabic" : ""}`}>
            {t("returnButton")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrderDetailsDialog;
