"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoItem } from "./video-item";
import { NavigationControls } from "./navigation-controls";
import { ShareDialog } from "./share-dialog";
import { useTranslations } from "next-intl";
import { toast } from "@/hooks/use-toast";
import type { ShortsData } from "./types";

interface ShortsScrollProps {
  videos?: ShortsData;
}

export default function ShortsScroll({ videos }: ShortsScrollProps) {
  const t = useTranslations("shorts");
  const parentRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [detailsVisibility, setDetailsVisibility] = useState<
    Record<string, boolean>
  >({});
  const [shareDialog, setShareDialog] = useState<{
    isOpen: boolean;
    videoId: string;
  }>({
    isOpen: false,
    videoId: "",
  });

  const videosData = useMemo(() => videos?.data || [], [videos]);

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: videosData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => window.innerHeight,
    overscan: 2,
  });

  // Smooth scrolling functions
  const scrollToNext = useCallback(() => {
    if (parentRef.current) {
      const scrollDistance = parentRef.current.clientHeight;
      parentRef.current.scrollBy({
        top: scrollDistance,
        behavior: "smooth",
      });
    }
  }, []);

  const scrollToPrevious = useCallback(() => {
    if (parentRef.current) {
      const scrollDistance = parentRef.current.clientHeight;
      parentRef.current.scrollBy({
        top: -scrollDistance,
        behavior: "smooth",
      });
    }
  }, []);

  // Video intersection observer for autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            videoElement
              .play()
              .then(() => {
                // Unmute after successful play to avoid autoplay restrictions
                videoElement.muted = false;
              })
              .catch((error) => {
                console.warn(t("video.playError"), error);
                toast({
                  title: t("video.autoplayBlocked"),
                  variant: "destructive",
                  duration: 3000,
                });
              });
          } else {
            videoElement.pause();
          }
        });
      },
      {
        root: parentRef.current,
        threshold: 0.6, // 60% of video must be visible
      }
    );

    // Observe all video elements
    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [videosData, t]);

  // Toggle details visibility for specific video
  const toggleDetails = useCallback((videoId: string) => {
    setDetailsVisibility((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  }, []);

  // Handle share dialog
  const handleShare = useCallback((videoId: string) => {
    setShareDialog({ isOpen: true, videoId });
  }, []);

  const closeShareDialog = useCallback(() => {
    setShareDialog({ isOpen: false, videoId: "" });
  }, []);

  // Loading state
  if (!videos) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-screen w-full" />
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex md:container mx-auto bg-background">
      {/* Main scroll container */}
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
        <div className="relative w-full">
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const video = videosData[virtualItem.index];

            return (
              <VideoItem
                key={video._id}
                video={video}
                isDetailsVisible={detailsVisibility[video._id] || false}
                onToggleDetails={() => toggleDetails(video._id)}
                onShare={() => handleShare(video._id)}
                videoRef={(el) => (videoRefs.current[virtualItem.index] = el)}
              />
            );
          })}
        </div>
      </div>

      {/* Navigation controls for desktop */}
      <NavigationControls
        onScrollUp={scrollToPrevious}
        onScrollDown={scrollToNext}
      />

      {/* Share dialog */}
      <ShareDialog
        isOpen={shareDialog.isOpen}
        onClose={closeShareDialog}
        videoId={shareDialog.videoId}
      />
    </div>
  );
}
