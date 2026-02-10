"use client";

import { forwardRef } from "react";
import HLSPlayer from "@/components/shared/phone/HlsPlayer";
import { VideoControls } from "./video-controls";
import { VideoDetailsPanel } from "./video-details-panel";
import type { Event } from "./types";

interface VideoItemProps {
  video: Event;
  isDetailsVisible: boolean;
  onToggleDetails: () => void;
  onShare: () => void;
  videoRef: (el: HTMLVideoElement | null) => void;
}

export const VideoItem = forwardRef<HTMLDivElement, VideoItemProps>(
  ({ video, isDetailsVisible, onToggleDetails, onShare, videoRef }, ref) => {
    return (
      <div
        ref={ref}
        className="h-screen snap-start flex items-center justify-center gap-4 md:p-6 lg:p-8 relative"
      >
        {/* Video Player */}
        <div className="flex h-full w-full md:w-[450px] lg:w-[500px] relative shadow-2xl">
          <HLSPlayer
            manifest={video.imageUrl}
            ref={videoRef}
            isActive={true}
            autoPlay
            loop
            muted
            controls
            className="md:rounded-2xl object-cover w-full h-full"
          />
          {/* Video Title */}
          <div className="absolute bottom-4 left-4 right-16">
            <h4 className="text-white font-bold text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {video.title}
            </h4>
          </div>
          {/* Video Controls Overlay */}

          <VideoControls onToggleDetails={onToggleDetails} onShare={onShare} />
        </div>

        {/* Details Panel */}
        <VideoDetailsPanel
          video={video}
          isVisible={isDetailsVisible}
          onClose={onToggleDetails}
          isMobile={true}
        />
      </div>
    );
  },
);

VideoItem.displayName = "VideoItem";
