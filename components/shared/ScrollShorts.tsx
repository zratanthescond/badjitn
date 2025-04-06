"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { IEvent } from "@/lib/database/models/event.model";

import Image from "next/image";
import HomePostContainer from "./HomePostContainer";
import { AspectRatio } from "../ui/aspect-ratio";
import HLSPlayer from "./phone/HlsPlayer";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { NavigationMenuContent } from "@radix-ui/react-navigation-menu";
import { Button } from "../ui/button";
import ReelDetails from "../ReelDetails";
import { Event } from "@/types";
import {
  ArrowBigLeft,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Facebook,
  Globe,
  Heart,
  Instagram,
  List,
  MoreHorizontal,
  Share,
  Share2Icon,
  Twitter,
} from "lucide-react";
import { IoClose } from "react-icons/io5";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
} from "../ui/alert-dialog";

import { Input } from "../ui/input";
import { FaWhatsapp } from "react-icons/fa6";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { XProfileCard } from "./Xprofile";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useGetEventSponsors } from "@/hooks/useGetEventSponsors";
import { Card } from "../ui/card";
import { borderColors } from "@/constants";
import SponsorsSection from "./SponsorSection";
import { vi } from "date-fns/locale";
type Props = {
  data: Event[];
  totalPages: number;
};
const ShortsScroll = ({ videos }: { videos?: Props }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  if (!videos) {
    return <Skeleton className="h-[100vh] w-full " />; // Fallback UI
  }

  const [show, setShow] = useState<boolean>(false);
  console.log(videos.data[0].organizer);
  const { height: containerHeight } =
    parentRef.current?.getBoundingClientRect() || { height: 0 };
  // Virtualizer for dynamic rendering
  const rowVirtualizer = useVirtualizer({
    count: videos.data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => containerHeight,
    overscan: 5,
  });
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const videosData = useMemo(() => videos.data, [videos.data]);
  const Router = useRouter();

  const scrollToNext = () => {
    if (parentRef.current) {
      const scrollDistance = parentRef.current.clientHeight; // Height of one full screen
      parentRef.current.scrollBy({ top: scrollDistance, behavior: "smooth" });
    }
  };

  const scrollToPrevious = () => {
    if (parentRef.current) {
      const scrollDistance = parentRef.current.clientHeight;
      parentRef.current.scrollBy({
        top: -scrollDistance,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            videoElement
              .play()
              .catch((e) => {
                console.error("Failed to play video.", e);
              })
              .then(() => {
                videoElement.muted = false;
              });
          } else {
            videoElement.pause();
          }
        });
      },
      {
        root: parentRef.current,
        threshold: 0.5, // At least 50% of the video should be visible to play
      }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [videosData, parentRef.current]);

  return (
    <>
      <div
        ref={parentRef}
        className="shorts-scroll-container [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          position: "relative",
          width: "100vw",
        }}
      >
        <div className="relative w-full ">
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const video = videos?.data[virtualItem.index];

            return (
              <div
                key={video._id}
                className="h-screen  snap-start flex items-center justify-end gap-2 md:p-4 md:m-4 "
              >
                <div className="flex h-full w-full md:w-1/4 lg:w-1/4">
                  <HLSPlayer
                    manifest={video.imageUrl}
                    ref={(el) => (videoRefs.current[virtualItem.index] = el)}
                    autoPlay
                    loop
                    muted
                    controls
                    className="md:rounded-xl object-fill w-full h-full   "
                  />
                  <div className="flex h-screen pointer-events-none justify-between w-full absolute flex-col p-2 md:w-1/4">
                    <Button
                      size={"icon"}
                      className="glass rounded-full  pointer-events-auto"
                      onClick={() => {
                        Router.push("/");
                      }}
                    >
                      <ArrowLeft color="white" />
                    </Button>
                    <div className="pr-3 max-h-fit max-w-fit self-end justify-self-end items-center pointer-events-auto justify-evenly gap-3 flex flex-col">
                      <Button
                        size={"icon"}
                        className="glass rounded-full "
                        onClick={() => {
                          setShow(!show);
                        }}
                      >
                        <List color="white" />
                      </Button>
                      <Button size={"icon"} className="glass rounded-full ">
                        <Heart color="white" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button size={"icon"} className="glass rounded-full ">
                            <Share2Icon color="white" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <div className="glass flex flex-col w-full p-5 gap-3 rounded-lg">
                            <Input
                              type="url"
                              value={`${process.env.NEXT_PUBLIC_SERVER_URL}/events/${video._id}`}
                            />
                            <Button className="glass rounded-lg text-white">
                              <Facebook color="white" />
                              Facebook
                            </Button>
                            <Button className="glass rounded-lg text-white">
                              <Twitter color="white" />
                              X/Twitter
                            </Button>
                            <Button className="glass rounded-lg text-white">
                              <Instagram color="white" />
                              Instagram
                            </Button>
                            <Button className="glass rounded-lg text-white">
                              <FaWhatsapp color="white" size={25} />
                              Whatsapp
                            </Button>
                            <div className="flex flex-row items-center justify-evenly">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction>OK</AlertDialogAction>
                            </div>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <h4 className="text-white pb-10">{video.title}</h4>
                  </div>
                </div>{" "}
                <div
                  className={`${
                    show
                      ? "flex top-[30vh] bg-card/5 md:top-auto max-h-[70vh] md:max-h-full"
                      : "hidden  md:flex"
                  } flex-col glass  fixed bottom-0  md:max-w-prose md:relative  rounded-2xl w-full  md:h-full items-center justify-start gap-2   animate-accordion-down repeat-1`}
                >
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    className=" absolute top-0 right-0 rounded-full z-10 md:hidden"
                    onClick={() => {
                      setShow(!show);
                    }}
                  >
                    <IoClose size={25} strokeWidth={25} color="white" />
                  </Button>
                  <ScrollArea className="w-full h-full">
                    <div className="flex flex-row items-start justify-between  w-full p-2 ">
                      <XProfileCard
                        username={
                          video.organizer.firstName +
                          " " +
                          video.organizer.lastName
                        }
                        avatarUrl={video.organizer.photo}
                        isVerified={
                          video.organizer.publisher &&
                          video.organizer.publisher === "approved"
                        }
                        handle={video.organizer.username}
                        organization={video.organizer.organisationName}
                        bio={video.organizer.organisationDescription}
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between p-2">
                      {/* {sponsors && !isPending && sponsors.data && (
                          // sponsors.data.map((card, index) => (
                          //   <div
                          //     key={index}
                          //     className="hexagon-border !w-[15vh] !h-[15vh] !rounded-md"
                          //     style={{
                          //       "--border-color":
                          //         borderColors[index % borderColors.length],
                          //     }}
                          //   >
                          //     <a
                          //       href={card.website}
                          //       target="_blank"
                          //       rel="noopener noreferrer"
                          //     >
                          //       <Card
                          //         className="hexagon !w-[14vh] !h-[14vh] "
                          //         style={{
                          //           backgroundImage: `url(${card.logo})`,
                          //           backgroundSize: "contain",
                          //           backgroundPosition: "center",
                          //           backgroundRepeat: "no-repeat",
                          //           backgroundOrigin: "border-box",
                          //         }}
                          //       ></Card>
                          //     </a>
                          //   </div>
                          // ))}
                        
                        )} /*/}{" "}
                      {video.sponsors && video.sponsors.length > 0 && (
                        <SponsorsSection sponsorsIds={video.sponsors} />
                      )}
                    </div>
                    <h1 className="font-semibold text-center w-full text-3xl py-4">
                      {video.title}
                    </h1>
                    <div className="flex flex-row items-center justify-between p-2">
                      <div className="flex gap-2 mb-4">
                        <Badge className="bg-pink-500 hover:bg-pink-600">
                          {video?.category ? video.category.name : "All"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <a
                          href={video.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-link mt-0.5"
                        >
                          <Button
                            variant={"outline"}
                            size={"sm"}
                            className=" text-sm flex flex-row rounded-full items-center"
                          >
                            <Globe className="mr-1 h-4 w-4" />
                            Check website
                          </Button>
                        </a>
                      </div>
                    </div>
                    <ReelDetails event={video} />
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fixed hidden md:flex mx-2 h-screen top-0 right-0   flex-col items-center justify-center gap-2 p-2">
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={scrollToPrevious}
          className="rounded-full"
        >
          <ArrowUp className="h-10 w-10" />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={scrollToNext}
          className="rounded-full"
        >
          <ArrowDown className="h-10 w-10" />
        </Button>
      </div>
    </>
  );
};

export default ShortsScroll;
