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
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";

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
  const [error, setError] = useState<{ description: string; price: string }>({
    description: "",
    price: "",
  });
  const handleAddPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    setError({ description: "", price: "" });
    planDecription.length < 10 &&
      setError((prevError) => ({
        ...prevError,
        description: "plan description must be more than 10 character",
      }));
    planPrice <= 0 &&
      setError((prevError) => ({
        ...prevError,
        price: "plan price must be more than 0",
      }));
    const plan: pricePlan = { name: "", price: 0 };
    console.log(planDecription);
    if (planDecription.length > 10) {
      plan.name = planDecription;
      if (planPrice > 0) {
        plan.price = planPrice;
        console.log(plan);
        setPricePlan([...pricePlan, plan]);
        setPlanPrice(0);
        setPlanDecription("");
      }
    }
  };
  const removePlan = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setPricePlan((prevPlan) => prevPlan.filter((_, i: number) => i !== index));
  };
  return (
    <Card className="w-full flex flex-col rounded-2xl bg-transparent backdrop-filter backdrop-blur-lg">
      <div className="flex p-2 flex-col md:flex-row items-center justify-between">
        <p className=" font-light p-2  w-full  leading-none">Price plan</p>
        <Button
          variant={"outline"}
          size={"lg"}
          className=" rounded-full h-[54px]"
          onClick={() => setIsPricePlan(false)}
        >
          Return to simple price
        </Button>
      </div>
      <Separator className="mb-2" />
      <CardContent className="flex p-4 flex-col w-full items-start   gap-4 rounded-2xl    justify-between">
        <Input
          className="input-field glass"
          placeholder="Plan description"
          tabIndex={3}
          value={planDecription}
          onChange={(e) => setPlanDecription(e.target.value)}
        />

        <p className="text-sm font-medium text-destructive">
          {error.description}
        </p>

        <div className="flex gap-3  flex-row w-full items-start justify-center">
          <div className="flex gap-3 flex-col w-full items-start justify-start">
            <div className="flex gap-3 flex-row w-full items-start justify-start">
              <Input
                type="number"
                className="input-field glass"
                placeholder="price"
                onChange={(e) => setPlanPrice(Number(e.target.value))}
                value={planPrice}
              />
              <Input
                type="number"
                className="input-field glass"
                placeholder="Places"
                onChange={(e) => setPlanPrice(Number(e.target.value))}
                //value={planPrice}
              />
            </div>
            <p className="text-sm font-medium text-destructive">
              {error.price}
            </p>
          </div>
          <Button
            onClick={handleAddPlan}
            variant={"outline"}
            size={"lg"}
            className=" rounded-full h-[54px]"
          >
            Add
          </Button>
        </div>
        <Separator className="my-2" />
        <ScrollArea className="w-full max-h-[400px] rounded-3xl  bg-transparent  px-2">
          {pricePlan.length > 0 ? (
            pricePlan
              .map((plan, index) => (
                <Card className="w-full my-2  rounded-3xl glass ">
                  <CardHeader className="min-w-full p-2 items-center justify-center">
                    <p className="leading-none">Plan n° {index}</p>

                    <Separator className="my-2" />
                  </CardHeader>

                  <CardContent className="items-center py-1 gap-4 ">
                    <p>{plan.name}</p>
                    <Separator className="my-2" />
                  </CardContent>
                  <CardFooter className="flex flex-row items-center  justify-between gap-4">
                    <Badge variant={"outline"} className="h-8">
                      {plan.price} TND
                    </Badge>
                    <Button
                      size={"icon"}
                      variant={"destructive"}
                      onClick={(e) => removePlan(e, index)}
                      className="rounded-full backdrop-blur-3xl"
                    >
                      <Trash color="white" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
              .reverse()
          ) : (
            <div className="w-full flex rounded-3xl  p-4 mt-4 items-center justify-center">
              <Button variant={"link"} onClick={() => setIsPricePlan(false)}>
                return to simple price
              </Button>
            </div>
          )}

          <ScrollBar />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
