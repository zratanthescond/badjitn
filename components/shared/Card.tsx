"use client";
import { IEvent } from "@/lib/database/models/event.model";
import { formatDateTime, getLastTwoWords } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
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
  User,
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useLocale } from "next-intl";

type CardProps = {
  event: IEvent;
  hasOrderLink?: boolean;
  hidePrice?: boolean;
};

const Card = ({ event, hasOrderLink, hidePrice }: CardProps) => {
  // const isEventCreator = userId.toString() === event.organizer._id.toString();

  const sponsored = event && event.Sponsors && event.Sponsors.length > 0;
  const [userId, setUserId] = useState<string>();
  const getUserId = async () => {
    const session = await useUser();
    // alert(JSON.stringify(session));
    setUserId(session._id);
  };
  useEffect(() => {
    getUserId();
  }, []);
  // const isEventCreator = userId && event.organizer._id.toString() === userId.toString();

  const locale = useLocale();

  const formattedDateParts =
    event &&
    useMemo(() => {
      const formatter = new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "2-digit",
      });

      const parts = formatter.formatToParts(new Date(event.startDateTime));
      const day = parts.find((p) => p.type === "day")?.value;
      const month = parts.find((p) => p.type === "month")?.value;

      return [month, day]; // or [day, month] depending on your layout
    }, [locale, event.startDateTime]);

  return (
    <div className="group relative  w-full max-w-[400px] flex-col overflow-hidden rounded-2xl backdrop-blur-sm  shadow-md transition-all hover:shadow-lg aspect-[9/16] md:min-h-[380px]">
      {userId && !hidePrice && !hasOrderLink && (
        <ReportComponent eventId={event._id} userId={userId.toString()} />
      )}
      <Link
        href={hidePrice ? {} : `/events/${event._id}`}
        className={`flex-center flex-grow  bg-cover bg-center text-grey-500 w-full h-full `}
      >
        <HomePostContainer
          src={event ? event.imageUrl : "/images/placeholder-event.jpg"}
          className={`rounded-xl flex w-full h-full ${hidePrice && "h-1/3"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t pointer-events-none from-black/90 via-black/30 to-transparent">
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
                {/* <div className="absolute right-2 top-2 flex flex-col gap-0 items-center p-1 bg-white/30  backdrop-brightness-100 rounded-full backdrop-blur-3xl w-11 h-11   shadow-sm transition-all">
                  <span className="text-white text-xs  font-bold">
                    {
                      formatDateTime(event.startDateTime).homeEvents.split(
                        " "
                      )[1]
                    }
                  </span>
                  <Separator className="m-0 p-0" />
                  <span className="text-white text-sm font-semibold">
                    {
                      formatDateTime(event.startDateTime).homeEvents.split(
                        " "
                      )[0]
                    }
                  </span>
                </div> */}
                <div className="absolute right-2 top-2 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-center ">
                  <div className="text-white font-semibold text-base sm:text-lg leading-none">
                    {/*  formatDateTime(event.startDateTime).homeEvents.split(
                        " "
                      )[1]*/}
                    {formattedDateParts?.[1]}
                  </div>
                  <div className="text-white/90 text-[10px] sm:text-xs leading-none mt-0.5">
                    {formattedDateParts?.[0]}
                  </div>
                </div>
                {/* <div className="absolute bottom-0 left-0 flex flex-col gap-0 items-center justify-evenly p-1  bg-white/10 backdrop-brightness-100 rounded-b-lg backdrop-blur-sm w-full h-1/5  shadow-sm transition-all">
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

                </div> */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10">
                  <h3 className="text-white font-medium text-sm mb-3 leading-tight line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Location and Time - Stacked for mobile */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-white/80 flex-shrink-0" />
                      <div className="text-white/90 text-xs leading-tight">
                        <div className="font-medium">
                          {getLastTwoWords(event.location?.name!)}
                        </div>
                        {event.country && (
                          <div className="text-white/70">
                            {getLastTwoWords(event.location?.name!)!
                              .split(" ")!
                              .pop()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-white/80 flex-shrink-0" />
                      <span className="text-white/90 text-xs font-medium">
                        {formatDateTime(event.startDateTime).timeOnly}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3">
                  <div className="w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                    <Avatar className="w-6 h-6">
                      <AvatarImage
                        src={event.organizer.photo}
                        className="rounded-full object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-[8px]">
                        {event.organizer.firstName?.[0]}
                        {event.organizer.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </>
            )}

            {hidePrice &&
              (event != null ? (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10">
                  <h3 className="text-white font-semibold text-sm mb-2 leading-tight line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-white/80" />
                      <div className="flex flex-wrap items-center gap-x-2 text-[10px] sm:text-xs text-white/90 font-medium">
                        <span>{formatDateTime(event.startDateTime).dateOnly}</span>
                        <span className="text-white/40">•</span>
                        <span>{formatDateTime(event.startDateTime).timeOnly}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex bg-black/20 items-center justify-center">
                  <span className="text-white text-xs">No event details</span>
                </div>
              ))}
          </div>
        </div>
      </Link>
      {hidePrice && userId && event && (
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
