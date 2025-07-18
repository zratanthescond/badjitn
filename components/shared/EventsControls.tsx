"use client";

import {
  AlertDialog,
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
import {
  Settings,
  ArrowRight,
  Edit,
  Trash2,
  Users,
  DollarSign,
} from "lucide-react";
import { Button } from "../ui/button";
import { FaHandshake } from "react-icons/fa";
import { PiHandCoins } from "react-icons/pi";
import ContributorSelection from "../HostContrebuer";
import SponsorComponent from "../SopnsorComponent";
import { ScrollBar, ScrollArea } from "../ui/scroll-area";
import type { IEvent } from "@/lib/database/models/event.model";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { useTranslations, useLocale } from "next-intl";

export const EventControls = ({ event }: { event: IEvent }) => {
  const t = useTranslations("eventControls");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState(false);
  const [isHostDialogOpen, setIsHostDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDialogClose = (
    setter: (value: boolean) => void,
    currentState: boolean
  ) => {
    setter(!currentState);
    setTimeout(() => {
      document.body.style.pointerEvents = "";
    }, 100);
  };

  return (
    <div className={`${isRTL ? "rtl" : "ltr"}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="glass rounded-full hover:bg-white/20 transition-all duration-200 backdrop-blur-md border border-white/10"
            size="icon"
            aria-label={t("settings")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={`glass backdrop-blur-md bg-black/80 border border-white/10 ${
            isRTL ? "font-arabic" : ""
          }`}
          align={isRTL ? "end" : "start"}
        >
          {/* Order Details */}
          <DropdownMenuItem className="focus:bg-white/10 transition-colors">
            <Link
              href={`/orders?eventId=${event._id}`}
              className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all hover:bg-white/5 ${
                isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span
                className={`text-white font-medium ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("orderDetails")}
              </span>
              <ArrowRight
                className={`h-4 w-4 text-white/70 ${isRTL ? "rotate-180" : ""}`}
              />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Host Contributor */}
          <DropdownMenuItem
            onSelect={(e) => (document.body.style.pointerEvents = "auto")}
            onClick={() => setIsHostDialogOpen(true)}
            className="focus:bg-white/10 transition-colors cursor-pointer"
          >
            <div
              className={`flex items-center gap-3 w-full p-2 ${
                isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span
                className={`text-white font-medium ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("hostContributor")}
              </span>
              <FaHandshake className="h-5 w-5 text-white/70" />
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Sponsor */}
          <DropdownMenuItem
            onSelect={(e) => (document.body.style.pointerEvents = "auto")}
            onClick={() => setIsSponsorDialogOpen(true)}
            className="focus:bg-white/10 transition-colors cursor-pointer"
          >
            <div
              className={`flex items-center gap-3 w-full p-2 ${
                isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span
                className={`text-white font-medium ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("sponsor")}
              </span>
              <PiHandCoins className="h-5 w-5 text-white/70" />
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Modify */}
          <DropdownMenuItem className="focus:bg-white/10 transition-colors">
            <Link
              href={`/events/${event._id}/update`}
              className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all hover:bg-white/5 ${
                isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span
                className={`text-white font-medium ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("modify")}
              </span>
              <Edit className="h-4 w-4 text-white/70" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Delete */}
          <DropdownMenuItem
            onSelect={(e) => (document.body.style.pointerEvents = "auto")}
            onClick={() => setIsDeleteDialogOpen(true)}
            className="focus:bg-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <div
              className={`flex items-center gap-3 w-full p-2 ${
                isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span
                className={`text-red-400 font-medium ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("delete")}
              </span>
              <Trash2 className="h-4 w-4 text-red-400" />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}
        eventId={event._id}
      />

      {/* Host Contributor Dialog */}
      <AlertDialog
        open={isHostDialogOpen}
        onOpenChange={() =>
          handleDialogClose(setIsHostDialogOpen, isHostDialogOpen)
        }
      >
        <AlertDialogContent
          className={`max-w-2xl h-screen ${isRTL ? "font-arabic" : ""}`}
        >
          <ScrollArea className="max-h-screen w-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <h2
                  className={`text-xl font-semibold ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("hostContributor")}
                </h2>
              </div>

              <ContributorSelection event={event} />

              <div
                className={`flex justify-end ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <AlertDialogAction className={`${isRTL ? "font-arabic" : ""}`}>
                  {t("return")}
                </AlertDialogAction>
              </div>
            </div>{" "}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sponsor Dialog */}
      <AlertDialog
        open={isSponsorDialogOpen}
        onOpenChange={() =>
          handleDialogClose(setIsSponsorDialogOpen, isSponsorDialogOpen)
        }
      >
        <AlertDialogContent
          className={`max-w-2xl h-screen ${isRTL ? "font-arabic" : ""}`}
        >
          <ScrollArea className="max-h-[95vh] w-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-primary" />
                <h2
                  className={`text-xl font-semibold ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("sponsor")}
                </h2>
              </div>

              <SponsorComponent event={event} />

              <div
                className={`flex justify-end ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <AlertDialogAction className={`${isRTL ? "font-arabic" : ""}`}>
                  {t("return")}
                </AlertDialogAction>
              </div>
            </div>{" "}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
