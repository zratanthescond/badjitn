import { Event } from "@/types";
import Checkout from "./Checkout";
import { useSession } from "next-auth/react";
import CheckoutButton from "./CheckoutButton";
import { IEvent } from "@/lib/database/models/event.model";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from "react";
export default function EventPriceComponent({ event }: { event: IEvent }) {
  const session = useSession();
  const [checkPlan, setCheckedPlan] = useState<number[]>([]);
  const handleAddPlan = (num: number) => {
    setCheckedPlan((prevNumbers) => {
      if (prevNumbers.includes(num)) {
        // If the number exists, remove it
        return prevNumbers.filter((n) => n !== num);
      } else {
        // If the number does not exist, add it
        return [...prevNumbers, num];
      }
    });
  };

  return (
    <div className="flex w-full rounded-2xl glass items-center flex-col p-1 ">
      {event.isFree == true ? (
        <span>This event is free</span>
      ) : parseFloat(event.price) > 0 ? (
        <span>Event total price {event.price}TND</span>
      ) : (
        event.pricePlan?.map((plan, index) => (
          <div
            key={index}
            className="flex w-full rounded-2xl flex-row justify-between p-4 glass m-1 "
          >
            <p> {plan.name}</p>
            <Badge>{plan.price}</Badge>
            <Checkbox onCheckedChange={() => handleAddPlan(index)} />
          </div>
        ))
      )}

      <CheckoutButton event={event} checkPlan={checkPlan} />
    </div>
  );
}
