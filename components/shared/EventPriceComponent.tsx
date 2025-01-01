import { Event } from "@/types";
import Checkout from "./Checkout";
import { useSession } from "next-auth/react";
import CheckoutButton from "./CheckoutButton";
import { IEvent } from "@/lib/database/models/event.model";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
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
    <div className="flex w-full rounded-2xl glass items-center flex-col p-2  ">
      <Card className="flex w-full glass flex-col rounded-2xl ">
        <CardHeader>
          <CardTitle className="text-slate-500">
            Buy a ticket or get a preorder
          </CardTitle>
        </CardHeader>
        <CardContent>
          {event.isFree == true ? (
            <span className="text-slate-500 glass">This event is free</span>
          ) : parseFloat(event.price) > 0 ? (
            <span className="text-slate-500">
              Event total price {event.price}TND
            </span>
          ) : (
            event.pricePlan?.map((plan, index) => (
              <div
                key={index}
                className="flex w-full items-center rounded-lg flex-row justify-between p-4 glass m-1 "
              >
                <p className="text-slate-500"> {plan.name}</p>
                <Badge>{plan.price}</Badge>
                <Checkbox
                  className="h-8 w-8"
                  onCheckedChange={() => handleAddPlan(index)}
                />
              </div>
            ))
          )}
        </CardContent>
        <CardFooter>
          <CheckoutButton event={event} checkPlan={checkPlan} />
          <Button className="text-white bg-pink-500">Get a preorder</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
