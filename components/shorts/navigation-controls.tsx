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
        variant="ghost"
        size="icon"
        onClick={onScrollUp}
        className="rounded-full bg-white/40 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white/80 dark:hover:bg-black/40 backdrop-blur-md h-12 w-12 shadow-xl ring-1 ring-black/5"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onScrollDown}
        className="rounded-full bg-white/40 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white/80 dark:hover:bg-black/40 backdrop-blur-md h-12 w-12 shadow-xl ring-1 ring-black/5"
      >
        <ArrowDown className="h-6 w-6" />
      </Button>
    </div>
  );
}
