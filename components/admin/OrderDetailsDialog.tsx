"use client";

import { Check, Eye, Receipt, User, Tag, CreditCard, Gift } from "lucide-react";
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

const OrderDetailsDialog = ({ value }: { value: any }) => {
  const t = useTranslations("orderDetailsDialog");
  const locale = useLocale();
  const isRTL = locale === "ar";

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
          className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full transition-all duration-200 hover:scale-105 ${
            isRTL ? "font-arabic" : ""
          }`}
        >
          <Eye className="h-4 w-4 mr-1" />
          {t("viewButton")}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent
        className={`glass bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl max-w-2xl max-h-[90vh] ${
          isRTL ? "rtl" : "ltr"
        }`}
      >
        <AlertDialogHeader className="space-y-3">
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
              <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <AlertDialogTitle
              className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
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
            {/* Order Plans Section */}
            <Card className="glass bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
              <CardHeader className="pb-4">
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Tag className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle
                      className={`text-lg text-green-800 dark:text-green-200 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("orderPlans.title")}
                    </CardTitle>
                    <CardDescription
                      className={`text-green-600 dark:text-green-300 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
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
                      className={`flex justify-between items-center p-3 glass bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-xl hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-200 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-1 rounded-full bg-green-500/20">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span
                          className={`font-medium ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          {detail.name}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="glass bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 font-semibold"
                      >
                        ${detail.price}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div
                    className={`flex items-center gap-3 p-3 glass bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-xl ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="p-1 rounded-full bg-green-500/20">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span
                      className={`font-medium ${isRTL ? "font-arabic" : ""}`}
                    >
                      {t("orderPlans.allPlansAvailable")}
                    </span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-4">
                {value?.type !== "hosted" ? (
                  <div className="w-full space-y-4">
                    <Separator className="bg-green-200/50 dark:bg-green-700/50" />

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
                        <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span
                          className={`font-semibold text-green-800 dark:text-green-200 ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          {t("payment.totalAmount")}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="glass bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300 text-lg font-bold px-4 py-2"
                      >
                        ${totalAmount.toFixed(2)}
                      </Badge>
                    </div>

                    {value?.discountInfo && (
                      <div className="space-y-2">
                        <div
                          className={`flex flex-wrap gap-2 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Badge className="glass bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 font-semibold">
                            <Gift className="h-3 w-3 mr-1" />
                            {t("discount.label")}: {value.discountInfo.value}%
                          </Badge>
                          <Badge className="glass bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 font-semibold">
                            {value.type === "paid"
                              ? t("payment.cashPaid")
                              : t("payment.toPay")}
                            : $
                            {(
                              (totalAmount / 100) *
                              value.discountInfo.value
                            ).toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-3 p-3 glass bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl w-full ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span
                      className={`font-medium text-blue-800 dark:text-blue-200 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("payment.hostedByAdmin")}
                    </span>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Buyer Information Section */}
            {value?.requiredUserInfo && value.requiredUserInfo.length > 0 && (
              <Card className="glass bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30">
                <CardHeader className="pb-4">
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className={isRTL ? "text-right" : ""}>
                      <CardTitle
                        className={`text-lg text-purple-800 dark:text-purple-200 ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("buyerInfo.title")}
                      </CardTitle>
                      <CardDescription
                        className={`text-purple-600 dark:text-purple-300 ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("buyerInfo.description")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {value.requiredUserInfo.map((info: any, index: number) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 glass bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-xl hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-200 ${
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
                          {info.label}:
                        </span>
                        {info.label === value.discountInfo?.label && (
                          <Badge
                            variant="outline"
                            className="glass bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs"
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
                          <Badge className="glass bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 font-semibold">
                            {info.value}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="glass bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300"
                          >
                            {value.discountInfo.value}%
                          </Badge>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="glass bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300"
                        >
                          {info.value}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel
            className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full transition-all duration-200 hover:scale-105 ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            {t("returnButton")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrderDetailsDialog;
