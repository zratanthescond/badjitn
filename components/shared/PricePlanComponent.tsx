import { CircleDot, Trash } from "lucide-react";
import { PiBasket, PiNotepad, PiNotepadBold } from "react-icons/pi";
import { Button } from "../ui/button";
import React, { useState } from "react";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { IoPersonRemoveOutline } from "react-icons/io5";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { pricePlan } from "@/types";

export default function PricePlanComponent({
  pricePlan,
  setPricePlan,
  setIsPricePlan,
}: {
  pricePlan: [pricePlan];
  setPricePlan: React.Dispatch<React.SetStateAction<pricePlan[]>>;
  setIsPricePlan: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [planDecription, setPlanDecription] = useState<string>("");
  const [planPrice, setPlanPrice] = useState<number>(0);
  const handleAddPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    const plan: pricePlan = { name: "", price: 0 };
    console.log(planDecription);
    if (planDecription.length > 10) {
      plan.name = planDecription;
      if (planPrice > 0) {
        plan.price = planPrice;
        console.log(plan);
        setPricePlan([...pricePlan, plan]);
      }
    }
  };
  const removePlan = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setPricePlan((prevPlan) => prevPlan.filter((_, i: number) => i !== index));
  };
  return (
    <div className="w-full flex flex-col items-center justify-center rounded-3xl glass p-2">
      <span className="text-white font-semibold p-2  w-full text-center">
        Add price plan
      </span>
      <div className="flex p-4 flex-col w-full items-center bg-white gap-4 rounded-2xl    justify-between">
        <textarea
          className=" focus:outline-none bg-slate-100 p-2 rounded-lg  w-full"
          placeholder="Plan description"
          tabIndex={3}
          value={planDecription}
          onChange={(e) => setPlanDecription(e.target.value)}
        />
        {planDecription.length < 10 && (
          <span className="w-full text-red-500 pl-2 font-extralight">
            plan description must be more than 10 character
          </span>
        )}
        <div className="flex gap-3  flex-row w-full items-center justify-center">
          <input
            type="number"
            className="input-field focus:outline-none w-1/2"
            placeholder="price"
            onChange={(e) => setPlanPrice(Number(e.target.value))}
            value={planPrice}
          />
          {planPrice <= 0 && (
            <span className="w-full text-red-500 pl-2 font-extralight">
              plan price must be more than 0 TND
            </span>
          )}
          <Button
            onClick={handleAddPlan}
            variant={"default"}
            className=" w-1/2 rounded-full h-[52px]"
          >
            Add
          </Button>
        </div>
      </div>
      <ScrollArea className="w-full max-h-52">
        {pricePlan.length > 0 ? (
          pricePlan
            .map((plan, index) => (
              <Card className="w-full my-2  rounded-3xl">
                <CardHeader className="min-w-full p-2 items-center justify-center">
                  <CardTitle>Plan n° {index}</CardTitle>
                </CardHeader>
                <CardContent className="items-center py-1 ">
                  <p>{plan.name}</p>
                </CardContent>
                <CardFooter className="flex flex-row items-center justify-between">
                  <Badge className="h-8">{plan.price} TND</Badge>
                  <Button
                    size={"icon"}
                    className="h-8"
                    onClick={(e) => removePlan(e, index)}
                  >
                    <Trash color="white" />
                  </Button>
                </CardFooter>
              </Card>
            ))
            .reverse()
        ) : (
          <div className="w-full flex rounded-3xl bg-white p-4 mt-4 items-center justify-center">
            <Button variant={"link"} onClick={() => setIsPricePlan(false)}>
              return to simple price
            </Button>
          </div>
        )}

        <ScrollBar />
      </ScrollArea>
    </div>
  );
}
