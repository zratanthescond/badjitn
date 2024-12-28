import { IEvent } from "@/lib/database/models/event.model";
import { formatDateTime } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
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

type CardProps = {
  event: IEvent;
  hasOrderLink?: boolean;
  hidePrice?: boolean;
};

const Card = async ({ event, hasOrderLink, hidePrice }: CardProps) => {
  const user = await useUser();
  const userId = user?._id!;
  // const userId = "676c87bddaac23a02d164642";
  const isEventCreator = userId === event.organizer._id.toString();

  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl backdrop-blur-sm glass shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      <Link
        href={`/events/${event._id}`}
        className="flex-center flex-grow glass bg-cover bg-center text-grey-500"
      >
        {/* IS EVENT CREATOR ... */}
        <HomePostContainer src={event.imageUrl} />
        {isEventCreator && !hidePrice && (
          <div className="absolute right-2 top-2 flex flex-col gap-4 rounded-xl glass p-3 shadow-sm transition-all">
            <Link href={`/events/${event._id}/update`}>
              <Image
                src="/assets/icons/edit.svg"
                alt="edit"
                width={20}
                height={20}
              />
            </Link>

            <DeleteConfirmation eventId={event._id} />
          </div>
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
          <Link
            href={`/orders?eventId=${event._id}`}
            className=" flex flex-row gap-2 rounded-xl glass p-2 shadow-sm transition-all"
          >
            <p className="text-white">Order Details</p>
            <Image
              src="/assets/icons/arrow.svg"
              alt="search"
              width={10}
              height={10}
            />
          </Link>
          <AlertDialog>
            <AlertDialogTrigger className="flex flex-row gap-2 rounded-xl glass p-2 shadow-sm transition-all">
              <p className="text-white"> Sponsor </p>
              <PiHandCoins size={20} stroke="white" color="white" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <SponsorComponent eventId={event._id} />
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Return</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger className="flex flex-row gap-2 rounded-xl glass p-2 shadow-sm transition-all">
              <p className="text-white"> Host a contrebuter </p>
              <FaHandshake size={20} stroke="white" color="white" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <ContributorSelection eventId={event._id} />
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Return</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
    //   </div>
    // </div>
  );
};

export default Card;
