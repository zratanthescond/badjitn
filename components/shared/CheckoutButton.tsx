"use client";

import { IEvent } from "@/lib/database/models/event.model";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import Checkout from "./Checkout";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { formatPriceByCountry } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";

const CheckoutButton = ({
  event,
  checkPlan,
  selectedOptions,
  discountInfo,
  requiredUserInfo,
  validateBeforeCheckout,
  beforeCheckout,
}: {
  event: IEvent;
  checkPlan?: string[];
  selectedOptions?: Record<string, string>;
  discountInfo?: any;
  requiredUserInfo?: any[];
  validateBeforeCheckout?: () => boolean;
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

  // Ensure event.pricePlan exists before reducing
  let initialPriceValue = 0;
  if (event.price) {
    initialPriceValue = parseFloat(event.price);
  } else if (event.pricePlan) {
    initialPriceValue = event.pricePlan.reduce((sum, item: any) => {
      return checkPlan?.includes(item._id!) ? sum + item.price : sum;
    }, 0);
  }

  const discountValue = Number(discountInfo?.value) || 0;
  const priceValue = initialPriceValue - (initialPriceValue * discountValue) / 100;
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
                      : `Pay now ${formatPriceByCountry(priceValue, event.country)}`}
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
