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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
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
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (event.isFree) {
        const order = await createOrder({
          eventId: event._id,
          totalAmount: "0",
          type: "paid",
          details,
          buyerId: userId || "",
          stripeId: uuidv4(),
          createdAt: new Date(),
        });

        if (order) {
          toast({
            title: "Billet obtenu",
            description: event.showWorkSubmissionPopup
              ? "Votre billet gratuit est confirme. Vous allez maintenant choisir si vous souhaitez soumettre un travail."
              : "Votre billet gratuit a bien ete confirme. Retrouvez-le des maintenant dans votre profil.",
          });
          router.push(
            event.showWorkSubmissionPopup
              ? `/events/${event._id}/post-purchase`
              : "/profile"
          );
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
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: event.isFree
          ? "Impossible d'obtenir le billet gratuit pour le moment. Veuillez reessayer."
          : "Impossible de finaliser l'achat du billet pour le moment. Veuillez reessayer.",
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
          disabled={price == 0 || isSubmitting}
          type="submit"
          role="link"
          className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-semibold shadow-lg shadow-pink-500/20 transition-all duration-300 "
        >
          <div className="flex items-center justify-center gap-3">
            <div className="bg-primary-foreground/20 p-1.5 rounded-full">
              <Ticket size={16} className="text-primary-foreground" />
            </div>
            <span>
              {event.isFree
                ? isSubmitting
                  ? "Obtention du billet..."
                  : "Get Ticket"
                : `Pay now ${formatPriceByCountry(price, event.country)}`}
            </span>
          </div>
        </Button>
      </motion.div>
    </form>
  );
};

export default Checkout;
