import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { IEvent } from "@/lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder } from "@/lib/actions/order.actions";
import { Detail } from "@/lib/database/models/order.model";

loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Checkout = ({
  event,
  userId,
  chekedPlans,
}: {
  event: IEvent;
  userId?: string;
  chekedPlans?: number[];
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
    if (chekedPlans && chekedPlans.length > 0) {
      let p = 0;
      let detail: Detail[] = [];
      event.pricePlan?.map((plan, index) => {
        if (chekedPlans.indexOf(index) !== -1) {
          p += plan.price;
          detail.push({ name: plan.name, price: plan.price.toString() });
        }
      });
      setPrice(p);
      setDetails(detail);
    }
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
    <form action={onCheckout} method="post">
      <Button
        type="submit"
        role="link"
        size="sm"
        className=" sm:w-fit h-10 m-4"
      >
        {event.isFree ? "Get Ticket" : "Pay now"}
      </Button>
    </form>
  );
};

export default Checkout;
