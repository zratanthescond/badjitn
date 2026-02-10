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
          className="glass-control rounded-full pointer-events-auto"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
      )}

      <div className=" max-h-fit absolute top-1/3 max-w-fit self-end justify-self-end items-center pointer-events-auto justify-evenly gap-3 flex flex-col">
        <Button
          size="icon"
          className="glass-control rounded-full"
          onClick={onToggleDetails}
        >
          <List className="h-5 w-5 text-white" />
        </Button>

        <Button
          size="icon"
          className="glass-control rounded-full"
        >
          <Heart className="h-5 w-5 text-white" />
        </Button>

        <Button
          size="icon"
          className="glass-control rounded-full"
          onClick={onShare}
        >
          <Share2Icon className="h-5 w-5 text-white" />
        </Button>
      </div>
    </div>
  );
}
