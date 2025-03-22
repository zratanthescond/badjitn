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
import Link from "next/link";
import React from "react";

const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  const user = await useUser();
  const userId = user?._id;
  //const userId = "676c87bddaac23a02d164642";
  const ordersPage = Number(searchParams?.ordersPage) || 1;
  const eventsPage = Number(searchParams?.eventsPage) || 1;

  const orders = await getOrdersByUser({ userId, page: ordersPage });

  const orderedEvents = orders?.data.map((order: IOrder) => order.event) || [];
  const organizedEvents = await getEventsByUser({ userId, page: eventsPage });

  return (
    <>
      {/* My Tickets */}
      <section className="backdrop-blur backdrop-brightness-90  bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">My Tickets</h3>
          <Button
            asChild
            variant={"outline"}
            size="lg"
            className="button hidden sm:flex"
          >
            <Link href="/#events">Explore More Events</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={orderedEvents}
          emptyTitle="No event tickets purchased yet"
          emptyStateSubtext="No worries - plenty of exciting events to explore!"
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={orders?.totalPages}
        />
      </section>

      {/* Events Organized */}
      <section className=" backdrop-blur backdrop-brightness-90 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">Events Organized</h3>
          <Button
            asChild
            size="lg"
            variant={"outline"}
            className="button hidden sm:flex"
          >
            <Link href="/events/create">Create New Event</Link>
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
          <h3 className="h3-bold text-center sm:text-left">My Sponsors</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant={"outline"} className="button">
                Add Sponsor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <SponsorForm userId={userId.toString()} />
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
            Custom required info
          </h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant={"outline"} className="button">
                Add new input
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
