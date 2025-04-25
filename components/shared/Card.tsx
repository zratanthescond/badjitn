"use client";
import { IEvent } from "@/lib/database/models/event.model";
import { formatDateTime, getLastTwoWords } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { use } from "react";
import { DeleteConfirmation } from "./DeleteConfirmation";
import HLSPlayer from "./phone/HlsPlayer";
import HomePostContainer from "./HomePostContainer";
import { useUser } from "@/lib/actions/user.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { PiHandCoins } from "react-icons/pi";
import { FaHandshake } from "react-icons/fa";
import SponsorComponent from "../SopnsorComponent";
import ContributorSelection from "../HostContrebuer";
import QRCode from "react-qr-code";
import {
  Clock,
  CogIcon,
  Flag,
  MapPin,
  QrCode,
  Radio,
  Timer,
  Watch,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { classNames } from "uploadthing/client";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { EventControls } from "./EventsControls";
import { Separator } from "../ui/separator";
import { FaEllipsis, FaEllipsisVertical } from "react-icons/fa6";
import ReportComponent from "./ReportComponent";
import TicketControleDropdown from "./TicketControleDropdown";

type CardProps = {
  event: IEvent;
  hasOrderLink?: boolean;
  hidePrice?: boolean;
};

const Card = ({ event, hasOrderLink, hidePrice }: CardProps) => {
  // const user = await useUser();
  // const userId = user?._id!;
  const userId = "676c87bddaac23a02d164642";
  // const isEventCreator = userId.toString() === event.organizer._id.toString();

  const sponsored = event.Sponsors && event.Sponsors.length > 0;

  return (
    <div className="group relative  w-full max-w-[400px] flex-col overflow-hidden rounded-xl backdrop-blur-sm  shadow-md transition-all hover:shadow-lg aspect-[9/16] md:min-h-[380px]">
      <Link
        href={hidePrice ? {} : `/events/${event._id}`}
        className={`flex-center flex-grow  bg-cover bg-center text-grey-500 w-full h-full`}
      >
        {/* IS EVENT CREATOR ... */}
        <div
          className={`rounded-xl w-full h-full flex items-center flex-col ${
            sponsored && " border-2  border-yellow-500 "
          }`}
        >
          {!hasOrderLink && sponsored && (
            <Badge className="absolute rounded-t-none  top-0 left-1/2 transform -translate-x-1/2 bg-yellow-500">
              Sponsored
            </Badge>
          )}
          {!hidePrice && !hasOrderLink && (
            <>
              {userId && (
                <ReportComponent
                  eventId={event._id}
                  userId={userId.toString()}
                />
              )}

              <div className="absolute right-2 top-2 flex flex-col gap-0 items-center p-1 bg-white/30  backdrop-brightness-100 rounded-full backdrop-blur-3xl w-11 h-11   shadow-sm transition-all">
                <span className="text-white text-xs  font-bold">
                  {formatDateTime(event.startDateTime).homeEvents.split(" ")[1]}
                </span>
                <Separator className="m-0 p-0" />
                <span className="text-white text-sm font-semibold">
                  {formatDateTime(event.startDateTime).homeEvents.split(" ")[0]}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 flex flex-col gap-0 items-center justify-evenly p-1  bg-white/10 backdrop-brightness-100 rounded-b-lg backdrop-blur-sm w-full h-1/5  shadow-sm transition-all">
                <span className="text-white text-xs  line-clamp-2 max-w-full max-h-1/2  font-semibold">
                  {event.title}
                </span>
                <Separator className="m-0 p-0" />

                {event.isOnline ? (
                  <Radio stroke="red-500" />
                ) : (
                  <div className="flex flex-row w-full items-center justify-evenly p-1">
                    <MapPin size={16} stroke="white" />
                    <span className="text-white flex flex-row text-xs font-semibold sm:text-xs sm:font-extralight">
                      {" "}
                      {getLastTwoWords(event.location?.name!)}
                    </span>
                    <span className="text-white flex flex-row text-xs font-extralight">
                      -
                    </span>
                    <Clock size={16} stroke="white" />
                    <span className="text-white flex flex-row text-xs font-extralight">
                      {formatDateTime(event.startDateTime).timeOnly}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
          <HomePostContainer
            src={event.imageUrl}
            className={`rounded-xl flex w-full h-full ${hidePrice && "h-1/3"}`}
          />
          {hidePrice && (
            <div className=" invisible group-hover:visible flex w-full h-2/3 glass animate-accordion-up flex-col absolute bottom-0 rounded-t-xl items-center gap-2 justify-start p-2 text-xs dark:text-white">
              <span>{event.title}</span>
              <div className="w-full border-b border-dashed border-muted my-2" />
              <div className="flex w-full flex-row items-center justify-between">
                <div className="flex flex-col items-center justify-center">
                  <span>Date</span>
                  <span>{formatDateTime(event.startDateTime).dateOnly}</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span>Time</span>
                  <span>{formatDateTime(event.startDateTime).timeOnly}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {hidePrice && (
          <TicketControleDropdown
            eventId={event._id.toString()}
            userId={userId.toString()}
          />

          // <AlertDialog>
          //   <AlertDialogTrigger className="absolute top-2 left-2 glass p-3 rounded-lg text-white flex flex-row gap-2">
          //     <p>details</p> <QrCode />
          //   </AlertDialogTrigger>
          //   <AlertDialogContent>
          //     <QRCode value={event._id} />
          //     <AlertDialogCancel>Return</AlertDialogCancel>
          //   </AlertDialogContent>
          // </AlertDialog>
        )}
      </Link>
      {/* <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
        {!hidePrice && (
          <div className="flex gap-2">
            <span className="p-semibold-14 w-min rounded-full bg-pink-500 px-4 py-1 text-green-60">
              {event.isFree ? "FREE" : `$${event.price}`}
            </span>
            <p className="p-semibold-14 w-min rounded-full bg-primary-500 px-4 py-1  line-clamp-1">
              {event.category.name}
            </p>
          </div>
        )}

        <p className="p-medium-16 p-medium-18">
          {formatDateTime(event.startDateTime).dateTime}
        </p>

        <Link href={`/events/${event._id}`}>
          <p className="p-medium-16 md:p-medium-20 line-clamp-2 flex-1 text-black">
            {event.title}
          </p>
        </Link>

        <div className="flex-between w-full">
          <p className="p-medium-14 md:p-medium-16 ">
            {event.organizer.firstName} {event.organizer.lastName}
          </p>*/}

      {hasOrderLink && (
        <div className="flex flex-col gap-2 absolute left-2 top-2 p-3 justify-start items-start">
          <EventControls event={event} />
        </div>
      )}
    </div>
    //   </div>
    // </div>
  );
};

export default Card;
