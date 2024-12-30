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
  ArrowLeft,
  Facebook,
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
type Props = {
  data: any;
  totalPages: number;
};
const ShortsScroll = ({ videos }: { videos?: Props }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  if (!videos) {
    return <div>Loading...</div>; // Fallback UI
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
              className="h-screen glass snap-start flex items-center justify-center gap-2 md:p-4 md:m-4 "
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
                <div className="flex h-full pointer-events-none justify-between w-full absolute flex-col p-2 md:w-1/4">
                  <Button
                    size={"icon"}
                    className="glass rounded-full  pointer-events-auto"
                    onClick={() => {
                      Router.push("/");
                    }}
                  >
                    <ArrowLeft color="white" />
                  </Button>
                  <div className="  pr-1 max-h-fit max-w-fit self-end justify-self-end items-center pointer-events-auto justify-evenly gap-3 flex flex-col">
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
              </div>
              <div
                className={`${
                  show ? "flex" : "hidden"
                } flex-col absolute bottom-0  md:relative glass rounded-lg w-full h-5/6 md:h-full items-center justify-start gap-2 p-2 md:w-1/2 animate-accordion-down repeat-1`}
              >
                <div className="flex flex-row items-start justify-between w-full">
                  <div className="flex flex-col items-start ">
                    <Image
                      src={video.organizer.photo}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="rounded-full ml-3"
                    />
                    <div className="flex flex-col items-start justify-start">
                      <h3 className="font-bold">{video.organizer.firstName}</h3>
                      <Button variant={"link"} size={"sm"}>
                        <p className="w-full">@{video.organizer.username}</p>
                      </Button>
                    </div>
                    <Button variant={"link"} size={"sm"}>
                      Follow
                    </Button>
                  </div>
                  <Button
                    className="glass rounded-full h-10 w-10"
                    onClick={() => {
                      setShow(!show);
                    }}
                  >
                    <IoClose size={25} strokeWidth={25} color="white" />
                  </Button>
                </div>
                <h1>{video.title}</h1>
                <ReelDetails event={video} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShortsScroll;
