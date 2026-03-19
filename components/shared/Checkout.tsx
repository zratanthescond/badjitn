import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { IEvent } from "@/lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder } from "@/lib/actions/order.actions";
import { Detail } from "@/lib/database/models/order.model";
import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import { json } from "stream/consumers";
import { formatPriceByCountry } from "@/lib/utils";
loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Checkout = ({
  event,
  userId,
  chekedPlans,
  discountInfo,
}: {
  event: IEvent;
  userId?: string;
  chekedPlans?: string[];
  discountInfo?: any;
}) => {
  const [price, setPrice] = useState<number>(0);
  const [details, setDetails] = useState<Detail[]>([]);
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      console.log(
        "Order canceled -- continue to shop around and checkout when you’re ready.",
      );
    }
  }, []);
  useEffect(() => {
    // 1. Initialize local variables
    let calculatedPrice = 0;
    let detail: Detail[] = [];

    // 2. Check for Plans FIRST (If plans exist, they usually override the base price)
    if (chekedPlans && chekedPlans.length > 0) {
      event.pricePlan?.forEach((plan: any) => {
        if (chekedPlans.includes(plan._id)) {
          calculatedPrice += plan.price;
          detail.push({ name: plan.name, price: plan.price.toString() });
        }
      });
      setPrice(calculatedPrice);
      setDetails(detail);
    }
    // 3. FALLBACK to Base Price if no plans are selected
    else if (event.price && parseFloat(event.price) > 0) {
      calculatedPrice = parseFloat(event.price);
      setPrice(calculatedPrice);
    }

    // 4. Apply Discount BEFORE setting final price
    const discountValue = Number(discountInfo?.value) || 0;
    if (discountValue > 0 && calculatedPrice > 0) {
      const discountedPrice = calculatedPrice - (calculatedPrice * discountValue) / 100;
      setPrice(discountedPrice);
    } else {
      setPrice(calculatedPrice);
    }

    // 5. Handle Free state
    if (event.isFree) {
      setPrice(-1);
    }
  }, [event, chekedPlans, discountInfo]);
  const onCheckout = async () => {
    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: price,
      isFree: event.isFree,
      buyerId: userId || "",
      details: details,
    };

    await checkoutOrder(order);
  };

  return (
    <form action={onCheckout} method="post" className="w-full">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          disabled={price == 0}
          type="submit"
          role="link"
          className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-semibold shadow-lg shadow-pink-500/20 transition-all duration-300 "
        >
          <div className="flex items-center justify-center gap-3">
            <div className="bg-primary-foreground/20 p-1.5 rounded-full">
              <Ticket size={16} className="text-primary-foreground" />
            </div>
            <span>
              {event.isFree ? "Get Free Ticket" : `Pay now ${formatPriceByCountry(price, event.country)}`}
            </span>
          </div>
        </Button>
      </motion.div>
    </form>
  );
};

export default Checkout;
