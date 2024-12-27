"use client";

import { IEvent } from "@/lib/database/models/event.model";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import Checkout from "./Checkout";
import { useSession } from "@clerk/clerk-react";
const CheckoutButton = ({
  event,
  checkPlan,
}: {
  event: IEvent;
  checkPlan?: number[];
}) => {
  const { session } = useSession();
  console.log(session);
  const hasEventFinished = new Date(event.endDateTime) < new Date();

  return (
    <div className="flex items-center gap-3">
      {hasEventFinished ? (
        <p className="p-2 text-red-400">
          Sorry, tickets are no longer available.
        </p>
      ) : (
        <>
          <SignedOut>
            <Button asChild className="button rounded-full" size="sm">
              <Link href="/sign-in">Get Tickets</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <Checkout
              chekedPlans={checkPlan}
              event={event}
              userId={session?.id}
            />
          </SignedIn>
        </>
      )}
    </div>
  );
};

export default CheckoutButton;
