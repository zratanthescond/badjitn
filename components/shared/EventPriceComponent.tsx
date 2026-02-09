"use client";
import CheckoutButton from "./CheckoutButton";
import type { IEvent } from "@/lib/database/models/event.model";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowRight, CheckCircle, Landmark, ShoppingBag, Ticket } from "lucide-react";
import DiscountDialog from "./DiscountDialog";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/lib/actions/user.actions";
import { createOrder } from "@/lib/actions/order.actions";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { BankTransferModal } from "./bank-transfer-modal";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
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
  const t = useTranslations("eventPrice");
  const { userId } = useAuth();
  const router = useRouter();


  const validateUserInfo = (
    objects: { [key: string]: string | number }[],
  ): boolean => {
    return (
      objects.every((obj) =>
        Object.values(obj).every(
          (value) => value !== "" && value !== null && value !== undefined,
        ),
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
    if (discountInfo && Number.parseFloat(String(discountInfo.value)) > 0) {
      const discountValue = Number.parseFloat(String(discountInfo.value));
      finalPrice = price - (price * discountValue) / 100;
    }
    return Number.parseFloat(String(finalPrice)).toFixed(2);
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
          title: t("success"),
          description: t("orderCreatedSuccess"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("orderCreatedError"),
        variant: "destructive",
      });
    }
  };

  const calculatePrice = (price: number) => {
    let finalPrice = Number.parseFloat(String(price)) || 0;
    if (discountInfo && Number.parseFloat(String(discountInfo.value)) > 0) {
      const discountValue = Number.parseFloat(String(discountInfo.value));
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
      <div className="absolute -top-6 -left-6 w-28 h-28 bg-primary/10 rounded-full blur-xl" />
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-xl" />

      <Card className="relative glass overflow-hidden w-full backdrop-blur-sm bg-card/90 border  shadow-2xl rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-pink-500 to-red-500 rounded-t-[2rem]" />

        <CardHeader className="pb-2 pt-8 px-8 items-center">
          <div className="flex items-center gap-2 shadow-md rounded-full mb-2">
            <span className="inline-flex items-center justify-center bg-card/10  text-xs font-medium px-3 py-1 rounded-full">
              <Ticket size={12} className="mr-1" />
              {event.title}
            </span>
          </div>
          <CardTitle className="text-2xl font-bold">{t("buyTicket")}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pb-8 px-8">
          {/* Discount and Pricing Section */}
          <div className="space-y-4">
            {/* Price Display */}
            <div className="flex items-center justify-between bg-card/5 shadow-md p-5 rounded-2xl border border-border/50">
              <p className="font-semibold text-foreground">{t("eventTotalPrice")}</p>
              <div className="text-right">
                {Number(discountInfo?.value) > 0 ? (
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-destructive line-through opacity-70">
                      {price} TND
                    </span>
                    <span className="text-2xl font-black text-primary animate-in fade-in zoom-in duration-300">
                      {calculatePriceAsNumber(price)} TND
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-black">
                    {price} TND
                  </span>
                )}
              </div>
            </div>

            {isAvailable() && (
              <> <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="outline"
                  className={`w-full py-6 rounded-2xl border-dashed border-2 transition-all duration-300 ${Number(discountInfo?.value) > 0
                    ? "border-green-500/50 bg-green-500/5 text-green-600 dark:text-green-400"
                    : "border-pink-500/30 hover:border-primary/60 hover:bg-primary/5"
                    }`}
                >
                  <span className="text-foreground font-medium text-pink-500">
                    {Number(discountInfo?.value) > 0
                      ? `Discount code applied: ${discountInfo.value}% OFF`
                      : "Have a discount code? Claim offer!"}
                  </span>
                </Button>
              </motion.div>
                <CheckoutButton
                  event={event}
                  checkPlan={checkPlan}
                  discountInfo={discountInfo}
                />


                <SignedIn>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={() => handleGetPreorder()}
                      disabled={isProcessing || price == 0}
                      variant={"outline"}
                      className="w-full h-14 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 hover:from-slate-700 hover:to-slate-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <div className="flex items-center justify-center gap-3">
                        {isProcessing ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <div className="bg-white/10 p-1.5 rounded-full">
                              <ShoppingBag size={16} className="text-white" />
                            </div>
                            <span>
                              {t("payInDoor")} {calculatePriceAsNumber(price)} TND
                            </span>
                            <ArrowRight
                              size={16}
                              className={`transition-transform duration-300 ${isHovered ? "translate-x-1" : ""
                                }`}
                            />
                          </>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                </SignedIn>
                <SignedOut>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={() => router.push("/sign-in")}
                      disabled={price == 0}
                      variant={"outline"}
                      className="w-full h-14 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 hover:from-slate-700 hover:to-slate-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="bg-white/10 p-1.5 rounded-full">
                          <ShoppingBag size={16} className="text-white" />
                        </div>
                        <span>
                          {t("payInDoor")} {calculatePriceAsNumber(price)} TND
                        </span>
                        <ArrowRight size={16} />
                      </div>
                    </Button>
                  </motion.div>
                </SignedOut>

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

                <SignedIn>
                  <BankTransferModal
                    eventId={event._id}
                    buyerId={userId || ""}
                    amount={Number(calculatePriceAsNumber(price))}
                    currency="TND"
                    details={event.pricePlan?.filter((item) => checkPlan.includes(item._id!)).map(item => ({
                      name: item.name,
                      price: item.price
                    })) || []}
                    requiredUserInfo={requiredUserInfo}
                    discountInfo={discountInfo}
                  />
                </SignedIn>
                <SignedOut>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={() => router.push("/sign-in")}
                      disabled={price == 0}
                      className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-semibold shadow-lg shadow-pink-500/20 transition-all duration-300"
                    >
                      <Landmark className="mr-2 h-5 w-5" />
                      Virement Bancaire {calculatePriceAsNumber(price)} TND
                    </Button>
                  </motion.div>
                </SignedOut>
              </>
            )}
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-sm pb-2">
            <div className="flex items-center glass gap-2 bg-muted/50 px-4 py-2 rounded-full border border-border/60">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-foreground font-bold">{t("secureCheckout")}</span>
            </div>
            <div className="flex items-center glass gap-2 bg-muted/50 px-4 py-2 rounded-full border border-border/60">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-foreground font-bold">{t("instantConfirmation")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
