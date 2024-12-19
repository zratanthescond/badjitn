"use client";

import React, { useEffect, useMemo, useRef } from "react";

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
type Props = {
  data: any;
  totalPages: number;
};
const ShortsScroll = ({ videos }: { videos?: Props }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  if (!videos) {
    return <div>Loading...</div>; // Fallback UI
  }

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
              {/* <HomePostContainer
                src={video.imageUrl}
                className="md:rounded-xl object-cover w-full h-full "
                width={400}
                height={500}
              /> */}
              <HLSPlayer
                manifest={video.imageUrl}
                ref={(el) => (videoRefs.current[virtualItem.index] = el)}
                autoPlay
                loop
                muted
                controls
                className="md:rounded-xl object-fill w-full h-full md:w-1/4 "
              />
              <div className="flex flex-col absolute md:relative glass rounded-lg w-full h-full items-center justify-start gap-2 p-2 md:w-1/2">
                <div className="flex flex-row items-center justify-between w-full">
                  <div className="flex flex-col items-start ">
                    <Image
                      src={"/assets/images/logo.png"}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="rounded-full ml-3"
                    />
                    <div className="flex flex-col items-start justify-start">
                      <h3 className="font-bold">{video.organizer.firstName}</h3>
                      <Button variant={"link"} size={"sm"}>
                        <p className="truncate w-20 hover:text-clip hover:w-full">
                          @{video.organizer.username}
                        </p>
                      </Button>
                    </div>
                    <Button variant={"link"} size={"sm"}>
                      Follow
                    </Button>
                  </div>
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
