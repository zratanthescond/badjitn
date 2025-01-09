"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
} from "../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

import { CogIcon } from "lucide-react";
import { Button } from "../ui/button";
import { FaHandshake } from "react-icons/fa";
import { PiHandCoins } from "react-icons/pi";
import ContributorSelection from "../HostContrebuer";
import SponsorComponent from "../SopnsorComponent";
import { ScrollBar, ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import { IEvent } from "@/lib/database/models/event.model";
import Link from "next/link";
import { useState } from "react";
import { DeleteConfirmation } from "./DeleteConfirmation";
export const EventControls = ({ event }: { event: IEvent }) => {
  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState(false);
  const [isHostDialogOpen, setIsHostDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild aria-expanded={"true"}>
          <Button className="glass rounded-full" size={"icon"}>
            <CogIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass">
          <DropdownMenuItem>
            <Link
              href={`/orders?eventId=${event._id}`}
              className=" flex flex-row gap-2 rounded-xl  p-2 shadow-sm transition-all"
            >
              <p className="text-white">Order Details</p>
              <Image
                src="/assets/icons/arrow.svg"
                alt="search"
                width={10}
                height={10}
              />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => (document.body.style.pointerEvents = "auto")}
            onClick={() => setIsHostDialogOpen(true)}
          >
            <p className="text-white"> Host a contributer </p>
            <FaHandshake size={20} stroke="white" color="white" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => (document.body.style.pointerEvents = "auto")}
            onClick={() => setIsSponsorDialogOpen(true)}
          >
            <p className="text-white"> Sponsor </p>
            <PiHandCoins size={20} stroke="white" color="white" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={`/events/${event._id}/update`}
              className="flex flex-row gap-2 rounded-xl  p-2 shadow-sm transition-all"
            >
              <span className="text-white">Modify</span>
              <Image
                src="/assets/icons/edit.svg"
                alt="edit"
                width={20}
                height={20}
              />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => (document.body.style.pointerEvents = "auto")}
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <span className="text-white">Delete</span>

            <Image
              src="/assets/icons/delete.svg"
              alt="edit"
              width={20}
              height={20}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteConfirmation
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}
        eventId={event._id}
      />
      <AlertDialog
        open={isHostDialogOpen}
        onOpenChange={(open) => {
          setIsHostDialogOpen(!isHostDialogOpen);
          setTimeout(() => {
            document.body.style.pointerEvents = "";
          }, 100);
        }}
      >
        <AlertDialogContent>
          <ScrollArea>
            <div className="max-h-96 w-full">
              <ContributorSelection event={event} />
              <ScrollBar orientation="vertical" />{" "}
            </div>
          </ScrollArea>

          <AlertDialogAction>Return</AlertDialogAction>
        </AlertDialogContent>{" "}
      </AlertDialog>
      <AlertDialog
        open={isSponsorDialogOpen}
        onOpenChange={(open) => {
          setIsSponsorDialogOpen(!isSponsorDialogOpen);
          setTimeout(() => {
            document.body.style.pointerEvents = "";
          }, 100);
        }}
      >
        <AlertDialogContent>
          <SponsorComponent eventId={event._id} />

          <AlertDialogAction>Return</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
