import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { IEvent } from "@/lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder } from "@/lib/actions/order.actions";
import { Detail } from "@/lib/database/models/order.model";
import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Checkout = ({
  event,
  userId,
  chekedPlans,
}: {
  event: IEvent;
  userId?: string;
  chekedPlans?: string[];
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
        "Order canceled -- continue to shop around and checkout when you’re ready."
      );
    }
  }, []);
  useEffect(() => {
    if (parseFloat(event.price) > 0) {
      console.log("price bigger than 0");
      setPrice(parseFloat(event.price));
    }
    if (chekedPlans && chekedPlans.length >= 0) {
      let p = 0;
      let detail: Detail[] = [];
      event.pricePlan?.map((plan, index) => {
        if (chekedPlans.indexOf(plan._id) !== -1) {
          p += plan.price;
          detail.push({ name: plan.name, price: plan.price.toString() });
        }
      });
      setPrice(p);
      setDetails(detail);
    }
    if (event.isFree) setPrice(-1);
  }, [event, chekedPlans]);
  const onCheckout = async () => {
    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: price,
      isFree: event.isFree,
      buyerId: userId,
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
          disabled={price == 0 || !event.isFree}
          type="submit"
          role="link"
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full py-7 font-medium shadow-lg shadow-pink-200/50 transition-all duration-300 "
        >
          <div className="flex w-full items-center justify-center gap-3">
            <div className="bg-black/10 p-1.5 rounded-full">
              <Ticket size={16} className="text-black" />
            </div>
            <span>
              {event.isFree ? "Get Free Ticket" : `Pay now  {price} TND`}
            </span>
          </div>
        </Button>
      </motion.div>
    </form>
  );
};

export default Checkout;
