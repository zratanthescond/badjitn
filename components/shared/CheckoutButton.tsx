"use client";

import { IEvent } from "@/lib/database/models/event.model";
import { SignedIn, SignedOut } from "./AuthWrappers";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import Checkout from "./Checkout";
import { useSession } from "@clerk/clerk-react";
import { AlertCircle, Ticket } from "lucide-react";
import { motion } from "framer-motion";

const CheckoutButton = ({
  event,
  checkPlan,
  discountInfo,
}: {
  event: IEvent;
  checkPlan?: string[];
  discountInfo?: any;
}) => {
  const { session } = useSession();

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
  const price = initialPriceValue - (initialPriceValue * discountValue) / 100;

  return (
    <div className="w-full">
      {hasEventFinished ? (
        <div className="space-y-5 w-full">
          <div className="flex items-center gap-3 p-4 bg-black/30 rounded-2xl border border-red-900/30">
            <div className="bg-red-500/10 p-2 rounded-full">
              <AlertCircle size={18} className="text-red-400" />
            </div>
            <p className="text-red-300 font-medium">
              Sorry, tickets are no longer available.
            </p>
          </div>
        </div>
      ) : (
        <>
          <SignedOut>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                asChild
                className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-semibold shadow-lg shadow-pink-500/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-primary-foreground/20 p-1.5 rounded-full">
                    <Ticket size={16} className="text-primary-foreground" />
                  </div>
                  <Link href="/sign-in">Pay now {price} TND</Link>
                </div>
              </Button>
            </motion.div>
          </SignedOut>

          <SignedIn>
            <Checkout
              chekedPlans={checkPlan}
              event={event}
              userId={session?.user?.id || ""} // Fixed: Ensure user ID is defined
              discountInfo={discountInfo}
            />
          </SignedIn>
        </>
      )}
    </div>
  );
};

export default CheckoutButton;
