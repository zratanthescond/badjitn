import SponsorForm from "@/components/shared/AddSponsorComponenet";
import Collection from "@/components/shared/Collection";
import FieldViewer from "@/components/shared/FieldViewer";
import FormBuilder from "@/components/shared/FormBuilder";
import HexGridSponsor from "@/components/shared/HexSponsor";
import HexGrid from "@/components/shared/HexSponsor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getEventsByUser } from "@/lib/actions/event.actions";
import { getOrdersByUser } from "@/lib/actions/order.actions";
import { useUser } from "@/lib/actions/user.actions";
import { IOrder } from "@/lib/database/models/order.model";
import { SearchParamProps } from "@/types";
import { auth } from "@clerk/nextjs";
import { get } from "http";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import React from "react";
export const dynamic = "force-dynamic";

const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  const user = await useUser();
  const userId = user?._id;
  //const userId = "676c87bddaac23a02d164642";
  const ordersPage = Number(searchParams?.ordersPage) || 1;
  const eventsPage = Number(searchParams?.eventsPage) || 1;

  const orders = await getOrdersByUser({ userId, page: ordersPage });

  const orderedEvents = orders?.data.map((order: IOrder) => order.event) || [];
  const organizedEvents = await getEventsByUser({ userId, page: eventsPage });
  const t = await getTranslations("profile");
  return (
    <>
      {/* My Tickets */}
      <section className="backdrop-blur backdrop-brightness-90  bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">{t("myTickets")}</h3>
          <Button
            asChild
            variant={"outline"}
            size="lg"
            className="button hidden sm:flex"
          >
            <Link href="/#events">{t("exploreMoreEvents")}</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        {/* <Collection
          data={orderedEvents}
          emptyTitle="No event tickets purchased yet"
          emptyStateSubtext="No worries - plenty of exciting events to explore!"
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={orders?.totalPages}
        /> */}
      </section>

      {/* Events Organized */}
      <section className=" backdrop-blur backdrop-brightness-90 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">
            {t("eventsOrganized")}
          </h3>
          <Button
            asChild
            size="lg"
            variant={"outline"}
            className="button hidden sm:flex"
          >
            <Link href="/events/create">{t("createNewEvent")}</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={organizedEvents?.data}
          emptyTitle="No events have been created yet"
          emptyStateSubtext="Go create some now"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages}
        />
      </section>
      <section className=" backdrop-blur backdrop-brightness-90 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">
            {t("mySponsors")}
          </h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant={"outline"} className="button">
                {t("addSponsor")}
              </Button>
            </DialogTrigger>
            <DialogContent className="min-w-full bg-card ">
              <ScrollArea className="h-[500px] w-full">
                <SponsorForm userId={userId.toString()} />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <section className="wrapper my-8">
        <HexGridSponsor userId={userId.toString()} />
      </section>
      <section className=" backdrop-blur backdrop-brightness-90 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">
            {t("customRequiredInfo")}
          </h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant={"outline"} className="button">
                {t("addCustomRequiredInfo")}
              </Button>
            </DialogTrigger>

            <DialogContent className="min-w-full bg-card ">
              <FormBuilder userId={userId.toString()} />
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <section className="wrapper my-8">
        <FieldViewer userId={userId.toString()} />
      </section>
    </>
  );
};

export default ProfilePage;
