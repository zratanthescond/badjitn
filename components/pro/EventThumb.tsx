"use client";

import HomePostContainer from "@/components/shared/HomePostContainer";
import { cn } from "@/lib/utils";

// Event visuals are either a plain image or an HLS video manifest (.m3u8), which an <img> cannot
// display. HomePostContainer is what the rest of the app uses: it extracts a poster frame for
// videos and falls back to a placeholder when the image fails to load.
export default function EventThumb({ src, className }: { src?: string; className?: string }) {
  return (
    <div className={cn("shrink-0 overflow-hidden rounded-lg bg-muted", className)}>
      <HomePostContainer src={src || ""} />
    </div>
  );
}
