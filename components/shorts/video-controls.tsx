"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, List, Share2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

interface VideoControlsProps {
  onToggleDetails: () => void;
  onShare: () => void;
  showBackButton?: boolean;
}

export function VideoControls({
  onToggleDetails,
  onShare,
  showBackButton = true,
}: VideoControlsProps) {
  const router = useRouter();

  return (
    <div className="flex h-screen pointer-events-none justify-between w-full absolute flex-col p-4">
      {showBackButton && (
        <Button
          size="icon"
          className="bg-black/20 hover:bg-black/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full  pointer-events-auto transition-all duration-300 shadow-lg"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-5 w-5 text-white drop-shadow-md" />
        </Button>
      )}

      <div className=" max-h-fit absolute top-1/3 max-w-fit self-end justify-self-end items-center pointer-events-auto justify-evenly gap-3 flex flex-col">
        <Button
          size="icon"
          className="bg-black/20 hover:bg-black/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all duration-300 shadow-lg"
          onClick={onToggleDetails}
        >
          <List className="h-5 w-5 text-white drop-shadow-md" />
        </Button>

        <Button
          size="icon"
          className="bg-black/20 hover:bg-black/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all duration-300 shadow-lg"
        >
          <Heart className="h-5 w-5 text-white drop-shadow-md" />
        </Button>

        <Button
          size="icon"
          className="bg-black/20 hover:bg-black/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all duration-300 shadow-lg"
          onClick={onShare}
        >
          <Share2Icon className="h-5 w-5 text-white drop-shadow-md" />
        </Button>
      </div>
    </div>
  );
}
