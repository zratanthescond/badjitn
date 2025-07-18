"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

interface NavigationControlsProps {
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export function NavigationControls({
  onScrollUp,
  onScrollDown,
}: NavigationControlsProps) {
  return (
    <div className="fixed hidden md:flex mx-4 h-screen top-0 right-0 flex-col items-center justify-center gap-4 p-4 z-10">
      <Button
        variant="outline"
        size="icon"
        onClick={onScrollUp}
        className="rounded-full bg-card-foreground/10 border-card-foreground/20 text-white hover:bg-white/20 backdrop-blur-md h-12 w-12"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onScrollDown}
        className="rounded-full bg-card-foreground/10 border-card-foreground/20 text-white hover:bg-white/20 backdrop-blur-md h-12 w-12"
      >
        <ArrowDown className="h-6 w-6" />
      </Button>
    </div>
  );
}
