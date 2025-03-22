"use client";
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
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import DiscountDialog from "./DiscountDialog";
import { se } from "date-fns/locale";
import { set } from "mongoose";
import { validate } from "uuid";
import { object } from "zod";
import { OrderType } from "@/lib/database/models/order.model";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/lib/actions/user.actions";
import { createOrder } from "@/lib/actions/order.actions";
import { v4 as uuidv4 } from "uuid";

export default function EventPriceComponent({ event }: { event: IEvent }) {
  const [checkPlan, setCheckedPlan] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [requiredUserInfo, setRequiredUserInfo] = useState<
    {
      label: string;
      field: string;
      type: string;
      value: string;
    }[]
  >([]);
  const [discountInfo, setDiscountInfo] = useState<{
    label: string;
    field: string;
    type: string;
    value: string | number;
    fieldValue: string;
  }>({
    label: "",
    field: "",
    type: "",
    value: "",
    fieldValue: "",
  });
  const [userId, setUserId] = useState<string>("");
  const getUserId = async () => {
    const session = await useUser();
    setUserId(session._id);
  };
  useEffect(() => {
    getUserId();
  }, []);
  const validate = (objects: { [key: string]: string | number }[]): boolean => {
    return (
      objects.every((obj) =>
        Object.values(obj).every(
          (value) => value !== "" && value !== null && value !== undefined
        )
      ) && objects.length > 0
    );
  };

  const handleAddPlan = (num: string) => {
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
  const price =
    event.price ||
    event.pricePlan?.reduce((sum, item) => {
      return checkPlan?.includes(item._id!) ? sum + item.price : sum;
    }, 0) ||
    0;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isAvailable = () => new Date(event.endDateTime) > new Date();
  const calculatePriceAsNumber = (price: number) => {
    let finalPrice = price;
    if (discountInfo && parseFloat(String(discountInfo.value)) > 0) {
      let discountValue = parseFloat(String(discountInfo.value));
      finalPrice = price - (price * discountValue) / 100;
    }
    return finalPrice.toFixed(2);
  };
  const handleGetPreorder = async () => {
    try {
      const details = event.pricePlan?.map((item) => {
        if (checkPlan.includes(item._id!) === true) {
          return {
            name: item.name,
            price: item.price,
          };
        }
      });
      console.log(details);
      const order = await createOrder({
        eventId: event._id,
        totalAmount: calculatePriceAsNumber(Number(event.price)),
        type: "doorpay",
        requiredUserInfo,
        discountInfo,
        details: details,
        buyerId: userId,
        stripeId: `${uuidv4()}`,
      });
      if (order) {
        toast({
          title: "Success",
          description: "Order created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const calculatePrice = (price: number) => {
    let finalPrice = parseFloat(String(price)) || 0;
    if (discountInfo && parseFloat(String(discountInfo.value)) > 0) {
      let discountValue = parseFloat(String(discountInfo.value));
      finalPrice = price - (price * discountValue) / 100;
      return `${finalPrice.toFixed(2)} Tnd ${discountInfo.value} % Off`;
    }
    return `${finalPrice.toFixed(2)} Tnd`;
  };
  useEffect(() => {
    calculatePrice(price);
  }, [discountInfo]);
  return (
    <div className="relative w-full max-w-full mx-auto">
      {/* Subtle glow effects */}
      <div className="absolute -top-6 -left-6 w-28 h-28 bg-card/5 rounded-full blur-xl" />
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-card/5 rounded-full blur-xl" />

      <Card className="relative glass overflow-hidden w-full backdrop-blur-sm bg-card/90 border  shadow-2xl rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-pink-500 to-red-500 rounded-t-[2rem]" />

        <CardHeader className="pb-2 pt-8 px-8 items-center">
          <div className="flex items-center gap-2 shadow-md rounded-full mb-2">
            <span className="inline-flex items-center justify-center bg-card/10  text-xs font-medium px-3 py-1 rounded-full">
              <Ticket size={12} className="mr-1" />
              {event.title}
            </span>
          </div>
          <CardTitle className="text-2xl font-bold">
            Buy a ticket or get a preorder
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pb-8 px-8">
          {event.isFree == true ? (
            <div className="flex items-center justify-between bg-card/5 shadow-md p-4 rounded-full">
              <p className=" font-medium pl-2">This event is free</p>
              <p className="bg-card text-xl font-bold  py-2 px-4 rounded-full shadow-sm">
                Free
              </p>
            </div>
          ) : parseFloat(event.price) > 0 ? (
            <div className="flex items-center justify-between bg-card/5 shadow-md p-4 rounded-full">
              <p className=" font-medium pl-2">Event total price</p>
              <p className="bg-card text-xl font-bold  py-2 px-4 rounded-full shadow-sm">
                {event.price}{" "}
                <span className="text-sm font-medium">{"TND"}</span>
              </p>
            </div>
          ) : (
            event.pricePlan?.map((plan, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-card/5 shadow-md p-4 rounded-full"
              >
                <p className=" font-medium pl-2">{plan.name}</p>
                <p className="bg-card text-xl font-bold  py-2 px-4 rounded-full shadow-sm">
                  {plan.price}{" "}
                  <span className="text-sm font-medium">{"TND"}</span>
                </p>
                <Checkbox
                  checked={checkPlan.includes(plan._id!) === true}
                  className="h-8 w-8 bg-card/5 shadow-md rounded-full"
                  onCheckedChange={() => handleAddPlan(plan._id)}
                />
              </div>
            ))
          )}

          <div className="flex flex-col gap-4">
            <CheckoutButton event={event} checkPlan={checkPlan} />
            {isAvailable() && (
              <>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={
                      event.requiredInfo && !validate(requiredUserInfo)
                        ? () => {
                            setIsDialogOpen(true);
                          }
                        : () => handleGetPreorder()
                    }
                    disabled={isProcessing || price == 0}
                    variant={"outline"}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full py-7 font-medium shadow-lg shadow-pink-200/50 transition-all duration-300"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {isProcessing ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      ) : (
                        <>
                          <div className="bg-black/10 p-1.5 rounded-full">
                            <ShoppingBag size={16} className="text-black" />
                          </div>
                          <span>Pay in door {calculatePrice(price)} </span>
                          <ArrowRight
                            size={16}
                            className={`transition-transform duration-300 ${
                              isHovered ? "translate-x-1" : ""
                            }`}
                          />
                        </>
                      )}
                    </div>
                  </Button>
                </motion.div>
                <DiscountDialog
                  setDiscountInfo={setDiscountInfo}
                  setRequiredUserInfo={setRequiredUserInfo}
                  isOpen={isDialogOpen}
                  onClose={() => {
                    setIsDialogOpen(false);
                  }}
                  requiredInfo={event.requiredInfo!}
                  discount={event.discount}
                />
              </>
            )}
          </div>
          <pre>
            <code> validate:{validate(requiredUserInfo).toString()}</code>
          </pre>

          <div className="pt-2 flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center glass gap-1 bg-white/5 px-3 py-1.5 rounded-full">
              <CheckCircle size={14} className="text-green-400" />
              <span>Secure checkout</span>
            </div>
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
            <div className="bg-white/5 px-3 py-1.5 glass rounded-full">
              Instant confirmation
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
