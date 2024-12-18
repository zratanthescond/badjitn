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
  Link,
  MapPin,
  Menu,
  Wallet,
} from "lucide-react";
import EventLocationComponent from "./shared/eventLocationComponent";
import EventPriceComponent from "./shared/EventPriceComponent";

export default function ReelDetails({ event }: { event: Event }) {
  const [section, setSection] = useState<string>("details");
  const DetailComponent = () => {
    return (
      <div className="w-full gap-2 glass p-2 rounded-2xl items-start flex flex-col">
        <Badge variant={"destructive"} className="p-2  text-white">
          {event.category.name}
        </Badge>
        <div
          className="border-2 glass p-1 rounded-lg mt-4 w-full truncate"
          dangerouslySetInnerHTML={{ __html: event.description }}
        ></div>
        <Badge>
          <Link size={15} className="mr-2 " />
          <a href={event.url}>{event.url}</a>
        </Badge>
      </div>
    );
  };
  const DateComponenet = () => {
    return (
      <div className=" flex gap-4 glass rounded-2xl p-2 flex-1 flex-col min-w-full items-start justify-start">
        <div className=" flex flex-row w-full items-center justify-between">
          <label className="flex flex-row  p-2 text-pink-600 font-semibold rounded-lg gap-2 items-start glass">
            <Calendar /> Start date:{" "}
          </label>

          <p className="font-semibold glass p-2 rounded-lg text-indigo-500">
            {formatDateTime(event.startDateTime).dateTime}
          </p>
        </div>

        <div className=" flex flex-row w-full items-center justify-between">
          <label className="flex flex-row  p-2 text-pink-600 font-semibold rounded-lg gap-2 items-start glass">
            <Calendar /> End date:{" "}
          </label>
          <p className="font-semibold glass p-2 rounded-lg text-indigo-500">
            {formatDateTime(event.endDateTime).dateTime}
          </p>
        </div>
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
      default:
        break;
    }
  };
  useEffect(() => {
    RenderComponent();
  }, [event, section]);
  return (
    <>
      <div className="flex glass p-2 rounded-md flex-row items-start w-full justify-between gap-2">
        <Button
          onClick={() => setSection("details")}
          variant={"default"}
          size={"sm"}
          className="glass text-pink-500"
        >
          <Menu />
          Details
        </Button>
        <Button
          onClick={() => setSection("date")}
          variant={"default"}
          size={"sm"}
          className="glass text-pink-500"
        >
          <CalendarDays />
          Date
        </Button>
        <Button
          onClick={() => setSection("location")}
          variant={"default"}
          size={"sm"}
          className="glass text-pink-500"
        >
          <MapPin />
          Location
        </Button>
        <Button
          onClick={() => setSection("price")}
          variant={"default"}
          size={"sm"}
          className="glass text-pink-500"
        >
          <Wallet />
          Price
        </Button>
      </div>
      <div className="flex w-full p-4">
        <RenderComponent />
      </div>
    </>
  );
}
