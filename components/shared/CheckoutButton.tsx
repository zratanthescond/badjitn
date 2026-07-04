"use client";

import { IEvent } from "@/lib/database/models/event.model";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import Checkout from "./Checkout";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { calcFinalPrice, formatPriceByCountry } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";

const CheckoutButton = ({
  event,
  checkPlan,
  selectedOptions,
  discountInfo,
  discountProofUrl,
  requiredUserInfo,
  validateBeforeCheckout,
  beforeCheckout,
}: {
  event: IEvent;
  checkPlan?: string[];
  selectedOptions?: Record<string, string>;
  discountInfo?: any;
  discountProofUrl?: string;
  requiredUserInfo?: any[];
  validateBeforeCheckout?: () => Promise<boolean> | boolean;
  beforeCheckout?: () => Promise<boolean> | boolean;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullPath = searchParams.toString() 
    ? `${pathname}?${searchParams.toString()}` 
    : pathname;
  
  const { userId } = useAuth();
  const t = useTranslations("eventPrice");

  const hasEventFinished = new Date(event.endDateTime) < new Date();

  const baseFee = event.price ? parseFloat(event.price) : 0;
  const planSum =
    checkPlan && checkPlan.length > 0 && event.pricePlan && event.pricePlan.length > 0
      ? event.pricePlan.reduce((sum, item: any) => {
          if (!checkPlan.includes(item._id!)) return sum;
          const selectedOptName = selectedOptions?.[item._id!];
          const optExtra = selectedOptName
            ? (item.options?.find((o: any) => (typeof o === "object" ? o.name : o) === selectedOptName)?.price || 0)
            : 0;
          return sum + item.price + optExtra;
        }, 0)
      : 0;
  const priceValue = calcFinalPrice(baseFee, planSum, discountInfo, event.pricePlan as any[], checkPlan, selectedOptions);
  const isActuallyFree = event.isFree || (priceValue === 0 && (checkPlan?.length || 0) > 0);

  const allowGuestRegistration = event.allowGuestRegistration !== false;

  return (
    <div className="w-full">
      {hasEventFinished ? (
        <div className="space-y-5 w-full">
          <div className="flex items-center gap-3 p-4 bg-black/30 rounded-2xl border border-red-900/30">
            <div className="bg-red-500/10 p-2 rounded-full">
              <AlertCircle size={18} className="text-red-400" />
            </div>
            <p className="text-red-300 font-medium">
              Sorry, registrations are no longer available.
            </p>
          </div>
        </div>
      ) : (
        <>
          {!userId && !allowGuestRegistration ? (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                asChild
                className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-semibold shadow-lg shadow-pink-500/20 transition-all duration-300"
              >
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(fullPath)}`}
                  className="flex items-center justify-center gap-3"
                >
                  <div className="bg-primary-foreground/20 p-1.5 rounded-full">
                    <Ticket size={16} className="text-primary-foreground" />
                  </div>
                  <span>
                    {isActuallyFree
                      ? t("inscription")
                      : `${t("payNow")} ${formatPriceByCountry(priceValue, event.country)}`}
                  </span>
                </Link>
              </Button>
            </motion.div>
          ) : (
            <Checkout
              chekedPlans={checkPlan}
              selectedOptions={selectedOptions}
              event={event}
              userId={userId || ""}
              discountInfo={discountInfo}
              discountProofUrl={discountProofUrl}
              requiredUserInfo={requiredUserInfo}
              validateBeforeCheckout={validateBeforeCheckout}
              beforeCheckout={beforeCheckout}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CheckoutButton;
