"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Globe } from "lucide-react";
import { IoClose } from "react-icons/io5";
import { XProfileCard } from "../shared/Xprofile";
import ReelDetails from "../ReelDetails";
import SponsorsSection from "../shared/SponsorSection";
import { useTranslations } from "next-intl";
import type { Event } from "./types";

interface VideoDetailsPanelProps {
  video: Event;
  isVisible: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export function VideoDetailsPanel({
  video,
  isVisible,
  onClose,
  isMobile = false,
}: VideoDetailsPanelProps) {
  const t = useTranslations("shorts.details");
  const c = useTranslations("category");

  const panelClasses = `
    ${isVisible
      ? "flex top-[12vh] md:top-auto max-h-[88vh] md:max-h-full glass w-full shadow-2xl"
      : "hidden md:flex backdrop-blur top-full max-h-0 overflow-hidden"
    } 
    flex-col fixed bottom-0 md:max-w-md md:relative rounded-t-3xl md:rounded-2xl w-full 
    md:h-full items-center justify-start gap-4 animate-accordion-down repeat-1
    transition-all duration-300 ease-in-out border-t md:border border-border/60
    [--glass-opacity:70%] [--glass-blur:80px] dark:[--glass-opacity:40%]
  `;

  return (
    <div className={panelClasses}>
      {isMobile && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 rounded-full z-10 md:hidden text-foreground hover:bg-muted/50 transition-colors duration-200 "
          onClick={onClose}
          aria-label={t("close")}
        >
          <IoClose size={20} />
        </Button>
      )}

      <ScrollArea className="w-full h-full">
        <div className="p-4 space-y-4">
          {/* Profile Section */}
          <div className="flex flex-row items-start justify-between w-full">
            <XProfileCard
              username={`${video.organizer.firstName} ${video.organizer.lastName}`}
              avatarUrl={video.organizer.photo}
              isVerified={video.organisation?.isVerified || false}
              handle={video.organizer.username}
              organization={video.organisation?.name || ""}
              bio={""}
            />
          </div>

          {/* Sponsors Section */}
          {video.sponsors && video.sponsors.length > 0 && (
            <div className="flex flex-row items-center justify-between">
              <SponsorsSection sponsorsIds={video.sponsors} />
            </div>
          )}

          {/* Title */}
          <h1 className="font-bold text-center w-full text-2xl md:text-3xl text-foreground leading-tight">
            {video.title}
          </h1>

          {/* Category and Website */}
          <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2">
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 transition-all duration-200">
                {c(video?.category?.name) || t("allCategories")}
              </Badge>
            </div>

            {video.url && (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm flex flex-row rounded-full items-center glass-control text-foreground transition-all duration-200 hover:scale-105 bg-transparent"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  {t("visitWebsite")}
                </Button>
              </a>
            )}
          </div>

          {/* Event Details */}
          <div className="bg-foreground/5 rounded-2xl p-4 backdrop-blur-sm border border-foreground/5">
            <ReelDetails event={video} />
          </div>
        </div>
        <ScrollBar orientation="vertical" className="bg-muted/50" />
      </ScrollArea>
    </div>
  );
}
