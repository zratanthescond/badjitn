"use client";

import ReelDetails from "../ReelDetails";
import SponsorsSection from "../shared/SponsorSection";
import HLSPlayer from "../shared/phone/HlsPlayer";
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
  const panelClasses = `
    ${isVisible
      ? "flex top-0 md:top-auto h-full md:h-full glass-panel w-full shadow-2xl"
      : "hidden md:flex backdrop-blur top-full max-h-0 overflow-hidden"
    } 
    flex-col fixed bottom-0 md:flex-1 md:relative rounded-none md:rounded-2xl w-full
    items-center justify-start gap-4 animate-accordion-down repeat-1
    transition-all duration-300 ease-in-out border-t md:border border-border/60
    [--glass-opacity:70%] [--glass-blur:80px] dark:[--glass-opacity:40%]
  `;

  return (
    <div className={panelClasses} style={{ minWidth: 0 }}>
      <div className="w-full h-full overflow-y-auto no-scrollbar overflow-x-hidden">
        <div className="p-4 space-y-4 text-slate-900 dark:text-white max-w-full overflow-hidden">
          {/* Sponsors Section */}
          {video.sponsors && video.sponsors.length > 0 && (
            <div className="flex flex-row items-center justify-between w-full overflow-hidden">
              <SponsorsSection sponsorsIds={video.sponsors} />
            </div>
          )}

          {/* Organizer, category badge and "visit website" link are shown
              once, in ReelDetails' own hero below — not duplicated here. */}

          {isMobile && (
            <div className="md:hidden overflow-hidden rounded-2xl border border-border/60 shadow-xl">
              <div className="mx-auto w-full max-w-[380px]">
                {video.imageUrl?.includes(".m3u8") ? (
                  <HLSPlayer
                    manifest={video.imageUrl}
                    isActive={isVisible}
                    autoPlay={false}
                    controls
                    muted
                    className="aspect-[9/16] h-auto w-full object-cover"
                  />
                ) : /\.(mp4|webm|ogg|mov)(\?|$)/i.test(video.imageUrl ?? "") ? (
                  <video
                    src={video.imageUrl}
                    controls
                    muted
                    playsInline
                    className="aspect-[9/16] h-auto w-full object-cover"
                  />
                ) : (
                  <img
                    src={video.imageUrl || "/assets/images/placeholder.png"}
                    alt={video.title}
                    className="aspect-[9/16] h-auto w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/images/placeholder.png";
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Event Details — ReelDetails owns its own flat background/cards now,
              so this wrapper stays unstyled to avoid stacking a second card. */}
          <div className="w-full overflow-hidden rounded-2xl">
            <ReelDetails event={video as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
