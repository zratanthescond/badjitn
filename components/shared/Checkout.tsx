import React, { useEffect, useState } from "react";

import { IEvent } from "@/lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder, createOrder } from "@/lib/actions/order.actions";
import { Detail } from "@/lib/database/models/order.model";
import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import { formatPriceByCountry } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

const Checkout = ({
  event,
  userId,
  chekedPlans,
  selectedOptions,
  discountInfo,
  requiredUserInfo,
  validateBeforeCheckout,
  beforeCheckout,
}: {
  event: IEvent;
  userId?: string;
  chekedPlans?: string[];
  selectedOptions?: Record<string, string>;
  discountInfo?: any;
  requiredUserInfo?: any[];
  validateBeforeCheckout?: () => boolean;
  beforeCheckout?: () => Promise<boolean> | boolean;
}) => {
  const [price, setPrice] = useState<number>(0);
  const [details, setDetails] = useState<Detail[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const t = useTranslations("eventPrice");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      console.log("Order canceled. Continue to shop around and checkout when you're ready.");
    }
  }, []);

  useEffect(() => {
    let calculatedPrice = 0;
    let detail: Detail[] = [];

    if (chekedPlans && chekedPlans.length > 0) {
      event.pricePlan?.forEach((plan: any) => {
        if (chekedPlans.includes(plan._id)) {
          calculatedPrice += plan.price;
          detail.push({ 
            name: plan.name, 
            price: plan.price.toString(),
            option: selectedOptions?.[plan._id]
          });
        }
      });
      setPrice(calculatedPrice);
      setDetails(detail);
    } else if (event.price && parseFloat(event.price) > 0) {
      calculatedPrice = parseFloat(event.price);
      setPrice(calculatedPrice);
    }

    const discountValue = Number(discountInfo?.value) || 0;
    if (discountValue > 0 && calculatedPrice > 0) {
      const discountedPrice = calculatedPrice - (calculatedPrice * discountValue) / 100;
      setPrice(discountedPrice);
    } else {
      setPrice(calculatedPrice);
    }

    if (event.isFree || (calculatedPrice === 0 && (chekedPlans?.length || 0) > 0)) {
      setPrice(-1);
    }
  }, [event, chekedPlans, discountInfo, selectedOptions]);

  const onCheckout = async () => {
    if (isSubmitting) return;

    if (validateBeforeCheckout && !validateBeforeCheckout()) {
      toast({
        title: "Erreur",
        description: "Veuillez completer les informations d'inscription avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (beforeCheckout) {
        const canContinue = await beforeCheckout();
        if (!canContinue) return;
      }

      if (event.isFree || price === -1) {
        const order = await createOrder({
          eventId: event._id,
          totalAmount: "0",
          type: "paid",
          details,
          buyerId: userId || "",
          requiredUserInfo: requiredUserInfo || [],
          ...(discountInfo && Number(discountInfo.value) > 0 ? { discountInfo } : {}),
          stripeId: uuidv4(),
          createdAt: new Date(),
        });

        if (order) {
          toast({
            title: "Inscription confirmee",
            description: "Votre inscription gratuite a bien ete confirmee.",
          });
          router.push(`/events/${event._id}?registered=1`);
        }

        return;
      }

      await checkoutOrder({
        eventTitle: event.title,
        eventId: event._id,
        price,
        isFree: event.isFree,
        buyerId: userId || "",
        details,
        requiredUserInfo: requiredUserInfo || [],
        discountInfo,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: event.isFree
          ? "Impossible de confirmer l'inscription gratuite pour le moment. Veuillez reessayer."
          : "Impossible de finaliser l'inscription pour le moment. Veuillez reessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={onCheckout} method="post" className="w-full">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          disabled={(price === 0 && !event.isFree) || isSubmitting}
          type="submit"
          role="link"
          className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-semibold shadow-lg shadow-pink-500/20 transition-all duration-300 "
        >
          <div className="flex items-center justify-center gap-3">
            <div className="bg-primary-foreground/20 p-1.5 rounded-full">
              <Ticket size={16} className="text-primary-foreground" />
            </div>
            <span>
              {(event.isFree || price === -1)
                ? isSubmitting
                  ? "Confirmation de l'inscription..."
                  : t("inscription")
                : `Pay now ${formatPriceByCountry(price, event.country)}`}
            </span>
          </div>
        </Button>
      </motion.div>
    </form>
  );
};

export default Checkout;
