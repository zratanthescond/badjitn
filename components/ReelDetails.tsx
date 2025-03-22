"use client";

import { IEvent } from "@/lib/database/models/event.model";
import { Button } from "./ui/button";
import { Event } from "@/types";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import {
  Calendar,
  CalendarDays,
  CalendarIcon,
  DoorOpen,
  Link,
  MapPin,
  Menu,
  MessageSquareIcon,
  Wallet,
} from "lucide-react";
import EventLocationComponent from "./shared/eventLocationComponent";
import EventPriceComponent from "./shared/EventPriceComponent";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { MinimalTiptapEditor } from "./minimal-tiptap";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import FeedBackComponenet from "./shared/FeedBackComponent";
import { differenceInDays, format } from "date-fns";

export default function ReelDetails({ event }: { event: Event }) {
  const [section, setSection] = useState<string>("details");

  const DetailComponent = () => {
    return (
      <div className="p-1 rounded-lg mt-4 w-full ">
        <h1 className="text-3xl font-bold text-center">{event.title}</h1>
        <div
          className="  p-1 rounded-lg mt-4 w-full"
          dangerouslySetInnerHTML={{ __html: event.description }}
        ></div>
      </div>
    );
  };
  const DateComponenet = () => {
    const formatDate = (date: Date) => {
      return format(date, "EEE, MMM d, h:mm a");
    };
    const daysDifference = differenceInDays(
      event.endDateTime,
      event.startDateTime
    );
    const hasDaysDifference = daysDifference > 0;
    return (
      <div className="flex flex-col gap-2 p-4 rounded-lg bg-card/80 w-full ">
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 " />
            <span className=" font-medium">Doors open at:</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-card/30 shadow-md ">
            {format(event.startDateTime, "h:mm a")}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 " />
            <span className=" font-medium">Start date:</span>
          </div>
          <div className="px-4 py-2 rounded-md ">
            {formatDate(event.startDateTime)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 " />
            <span className=" font-medium">End date:</span>
          </div>
          <div className="px-4 py-2 rounded-md ">
            {formatDate(event.endDateTime)}
          </div>
        </div>

        {hasDaysDifference && (
          <div className="mt-2 text-center">
            <span className="px-3 py-1 rounded-full shadow-md bg-card/30  text-sm font-medium">
              {daysDifference} {daysDifference === 1 ? "day" : "days"} event
            </span>
          </div>
        )}
      </div>
    );
  };
  const RenderComponent = () => {
    switch (section) {
      case "details":
        return <DetailComponent />;
        break;
      case "date":
        return <DateComponenet />;
      case "location":
        return <EventLocationComponent event={event} />;
      case "price":
        return <EventPriceComponent event={event} />;
      case "feedback":
        return <FeedBackComponenet eventId={event._id.toString()} />;
      default:
        break;
    }
  };
  useEffect(() => {
    RenderComponent();
  }, [event, section]);
  return (
    <div className=" flex md:max-w-prose md:w-[65ch] h-full bg-card  items-center flex-col md:dark:bg-card rounded-2xl  md:bg-card-foreground/10">
      <Tabs
        defaultValue={section}
        onValueChange={setSection}
        className="w-full  rounded-t-2xl items-center  sticky top-0 z-50 "
      >
        <TabsList className="w-full max-w-[97vw] rounded-b-none  flex gap-1 items-center dark:bg-card  justify-between rounded-t-2xl ">
          <ScrollArea className="rounded-2xl w-full">
            <div className="flex w-full flex-row my-2 items-center justify-between gap-2 ">
              <TabsTrigger value="details" asChild>
                <Button variant="outline" size="sm" className="rounded-full ">
                  <Menu className="h-3.5 w-3.5 mr-1" />
                  Details
                </Button>
              </TabsTrigger>
              <TabsTrigger value="date" asChild>
                <Button variant="outline" size="sm" className="rounded-full ">
                  <CalendarDays className="h-3.5 w-3.5 mr-1" />
                  Date
                </Button>
              </TabsTrigger>
              <TabsTrigger value="location" asChild>
                <Button variant="outline" size="sm" className="rounded-full ">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  Location
                </Button>
              </TabsTrigger>
              <TabsTrigger value="price" asChild>
                <Button variant="outline" size="sm" className="rounded-full ">
                  <Wallet className="h-3.5 w-3.5 mr-1" />
                  Price
                </Button>
              </TabsTrigger>
              <TabsTrigger value="feedback" asChild>
                <Button variant="outline" size="sm" className="rounded-full ">
                  <MessageSquareIcon className="h-3.5 w-3.5 mr-1" />
                  Feedback
                </Button>
              </TabsTrigger>
            </div>
            <ScrollBar orientation="horizontal" className="bg-zinc-700/50" />
          </ScrollArea>
        </TabsList>
      </Tabs>

      <div className="flex w-full  p-4">
        <RenderComponent />
      </div>
    </div>
  );
}
