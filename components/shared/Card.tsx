"use client";
import { IEvent } from "@/lib/database/models/event.model";
import { formatDateTime, getLastTwoWords } from "@/lib/utils";
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
import { useLocale, useTranslations } from "next-intl";

type CardProps = {
  event: IEvent;
  hasOrderLink?: boolean;
  hidePrice?: boolean;
  userPhoto?: string;
};

const Card = ({ event, hasOrderLink, hidePrice, userPhoto }: CardProps) => {
  const t = useTranslations("Card");
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
    <div className="group relative w-full max-w-[400px] flex-col overflow-hidden rounded-2xl glass-panel shadow-elite-soft transition-all duration-500 ease-elite-spring hover:-translate-y-2 hover:shadow-elite-glow aspect-[9/16] md:min-h-[400px]">
      {userId && !hidePrice && !hasOrderLink && (
        <div className="absolute top-3 left-3 z-10 transition-transform duration-300 group-hover:scale-110">
          <ReportComponent eventId={event._id} userId={userId.toString()} />
        </div>
      )}
      <Link
        href={hidePrice ? {} : `/events/${event._id}`}
        className="flex-center flex-grow bg-cover bg-center text-grey-500 w-full h-full relative"
      >
        <div className="absolute inset-0 z-0">
          <HomePostContainer
            src={event ? event.imageUrl : "/images/placeholder-event.jpg"}
            className="rounded-xl flex w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>
        
        <div className="absolute inset-0 z-1 bg-gradient-to-t pointer-events-none from-black/80 via-black/20 to-transparent dark:from-elite-charcoal/95 dark:via-elite-charcoal/40">
          <div
            className={`rounded-xl w-full h-full flex items-center flex-col relative ${
              sponsored && "border-2 border-primary/50 shadow-elite-glow"
            }`}
          >
            {sponsored && (
              <Badge className="absolute rounded-t-none top-0 left-1/2 transform -translate-x-1/2 bg-primary animate-pulse shadow-elite-glow">
                {t("sponsored")}
              </Badge>
            )}
            {!hidePrice && (
              <>
                <div className="absolute right-3 top-3 glass-control rounded-2xl px-3 py-1.5 text-center transition-all duration-500 group-hover:shadow-elite-glow group-hover:scale-110">
                  <div className="text-slate-900 dark:text-white font-syne font-bold text-xl leading-none">
                    {formattedDateParts?.[1]}
                  </div>
                  <div className="text-slate-600 dark:text-white/70 font-outfit text-[11px] uppercase tracking-wider leading-none mt-1">
                    {formattedDateParts?.[0]}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-white dark:from-elite-charcoal/90 via-white/80 dark:via-elite-charcoal/40 to-transparent pt-16 transition-all duration-500 group-hover:translate-y-[-5px]">
                  <h3 className="text-slate-900 dark:text-white font-syne font-bold text-lg md:text-xl mb-3 leading-tight line-clamp-2 tracking-tight group-hover:text-primary transition-colors duration-300">
                    {event.title}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-center w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10">
                        <MapPin className="h-3.5 w-3.5 text-elite-cyan" />
                      </div>
                      <div className="text-slate-600 dark:text-white/80 font-outfit text-xs leading-tight">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {getLastTwoWords(event.location?.name!)}
                        </div>
                        {event.country && (
                          <div className="text-slate-400 dark:text-white/50 text-[10px] uppercase tracking-widest mt-0.5">
                            {event.country}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex-center w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10">
                        <Clock className="h-3.5 w-3.5 text-elite-violet" />
                      </div>
                      <span className="text-slate-700 dark:text-white/80 font-outfit text-xs font-medium">
                        {formatDateTime(event.startDateTime, locale).timeOnly}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {hidePrice && event && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-elite-charcoal/90 via-white/80 dark:via-elite-charcoal/40 to-transparent pt-12">
                <h3 className="text-slate-900 dark:text-white font-syne font-bold text-base mb-2 leading-tight line-clamp-2">
                  {event.title}
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-600 dark:text-white/80 font-outfit">
                      <span className="font-semibold text-slate-900 dark:text-white">{formatDateTime(event.startDateTime, locale).dateOnly}</span>
                      <span className="text-slate-300 dark:text-white/20">•</span>
                      <span>{formatDateTime(event.startDateTime, locale).timeOnly}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            
            <div className="absolute bottom-4 right-4 z-10">
              <div className="w-10 h-10 glass-control rounded-full flex items-center justify-center p-0.5 shadow-elite-soft transition-transform duration-500 group-hover:scale-110">
                <Avatar className="w-full h-full">
                  <AvatarImage
                    src={userPhoto || event.organizer.photo}
                    className="rounded-full object-cover"
                  />
                  <AvatarFallback className="bg-primary/20 text-[10px] font-syne font-bold">
                    {event.organizer.firstName?.[0]}
                    {event.organizer.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
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
