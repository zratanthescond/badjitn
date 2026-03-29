"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X, Loader2, ArrowRight, Music2Icon, ListIcon, ListMusic, VideoIcon, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useRef, useState } from "react";
import { AudioPlayerList } from "./AudoPlayer";
import MusicUploader from "./MusicUploader";
import { useMusic } from "@/hooks/useMusic";
import Image from "next/image";
import { usePreview } from "@/hooks/usePreview";
import { Mixer } from "./Mixer";
import { IMusic } from "@/lib/database/models/music.model";
import { useReelCreate } from "@/hooks/useReelCreate";
import HLSPlayer from "./HlsPlayer";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import AudioWaveform from "./AudioWaveFrom";
export function ModifyVideo({ video, setVideo, setThumbnailUrl, userId }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useMusic(10, searchQuery);
  const [usedTrack, SetUsedTrack] = useState<IMusic | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [vDuration, setVDuration] = useState<number>(15);
  const [remPerSec, setRemPerSec] = useState<number>(8);
  const [showAudioEditor, setShowAudioEditor] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    data: reelData,
    isPending: reelLoading,
    error: reelError,
    mutate: reelMutate,
    isSuccess: reelSuccess,
  } = useReelCreate();
  useEffect(() => {
    console.log(reelData, reelLoading, reelError);
    if (reelData?.success == true) {
      //  alert(process.env.NEXT_PUBLIC_FILE_SERVER_URL + "/" + reelData.videoPath);
      setVideo(process.env.NEXT_PUBLIC_FILE_SERVER_URL + reelData.videoPath);
      const thumbnailPath =
        reelData.thumbnailUrl ||
        reelData.thumbnail ||
        reelData.poster ||
        reelData.preview;
      if (thumbnailPath) {
        setThumbnailUrl(
          String(thumbnailPath).startsWith("http")
            ? String(thumbnailPath)
            : process.env.NEXT_PUBLIC_FILE_SERVER_URL + thumbnailPath
        );
      }
      setIsDialogOpen(false);
    } else if (reelError) {
      toast({
        title: "Error",
        description: reelError.message || "Failed to create reel",
        variant: "destructive",
      });
    }
  }, [reelData, reelLoading, reelError, setThumbnailUrl]);

  useEffect(() => {
    console.log(video);
    if (videoRef.current) {
      videoRef.current.src = video;
    }
  }, [video, videoRef]);
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Global Sync Engine
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !usedTrack) return;

    const audioSrc = process.env.NEXT_PUBLIC_FILE_SERVER_URL + usedTrack.path;
    if (audio.src !== audioSrc) {
      audio.src = audioSrc;
    }

    if (isPlaying) {
      audio.play().catch(() => { });
    } else {
      audio.pause();
    }
  }, [isPlaying, usedTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;

    const targetTime = currentTime + selectedTime;
    if (Math.abs(audio.currentTime - targetTime) > 0.15) {
      audio.currentTime = targetTime;
    }
  }, [currentTime, selectedTime, isPlaying]);

  const processVideo = async (e: any) => {
    e.preventDefault();

    const data = new FormData();
    data.append("video", video);
    if (usedTrack) {
      data.append("usedTrack", JSON.stringify(usedTrack));
      data.append("selectedTime", selectedTime);
    }
    data.append("vDuration", String(vDuration));
    try {
      (reelMutate as any)(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reel",
        variant: "destructive",
      });
    }
  };
  const handleScrollCapture = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        // alert("Load more music");
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    },
    []
  );
  const allMusic = data?.pages.flatMap((page: any) => {
    if (Array.isArray(page)) return page;
    if (page?.data && Array.isArray(page.data)) return page.data;
    return [];
  }) ?? [];

  const t = useTranslations("videoEditor");
  const [showMusicSheet, setShowMusicSheet] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-10">
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex flex-row items-center gap-2 bg-pink-500/80 hover:bg-pink-600 transition-all duration-300 z-50 px-4 py-2 rounded-full text-white shadow-lg backdrop-blur-md border border-white/20"
          >
            <VideoIcon className="h-4 w-4" />
            <span className="font-semibold text-sm">{t("modifyVideo")}</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-[100vw] w-full h-[100dvh] p-0 border-0 bg-background dark:bg-black/95 backdrop-blur-xl flex flex-col md:max-w-4xl md:h-[90vh] md:rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative flex-1 flex flex-col min-h-0">
            {/* Header / Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
              <h2 className="text-foreground dark:text-white font-bold text-lg pointer-events-auto">
                {t("modifyVideo")}
              </h2>
              <div className="flex items-center gap-3 pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground/70 dark:text-white/70 hover:text-foreground dark:hover:text-white hover:bg-foreground/10 dark:hover:bg-white/10 rounded-full"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Main Editor Canvas */}
            <div className="flex-1 relative flex items-center justify-center bg-slate-50 dark:bg-black overflow-hidden group min-h-0">
              <div className="relative aspect-[9/16] h-full bg-slate-900 shadow-2xl overflow-hidden md:rounded-2xl transition-all duration-500 group-hover:scale-[1.01]">
                <HLSPlayer
                  manifest={video}
                  ref={videoRef as any}
                  isActive={isDialogOpen}
                  onLoadedMetadata={handleMetadataLoaded}
                  className="w-full h-full object-cover"
                  autoPlay={true}
                  loop={true}
                />

                {/* Vertical Action Bar Overlaid on Video */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-1 group/item">
                    <Button
                      variant="secondary"
                      size="icon"
                      className={`h-12 w-12 rounded-full backdrop-blur-md border-2 transition-all duration-300 ${usedTrack
                        ? "bg-pink-500 border-pink-400/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                        : "bg-background/80 dark:bg-white/10 border-foreground/10 dark:border-white/20 text-foreground dark:text-white hover:bg-background dark:hover:bg-white/20"
                        }`}
                      onClick={() => setShowMusicSheet(true)}
                    >
                      <Music2Icon className={`h-6 w-6 ${usedTrack ? "animate-spin-slow" : ""}`} />
                    </Button>
                    <span className="text-[10px] font-bold text-foreground dark:text-white drop-shadow-md uppercase tracking-wider">
                      Music
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-background/80 dark:bg-white/10 backdrop-blur-md border-2 border-foreground/10 dark:border-white/20 text-foreground dark:text-white hover:bg-background dark:hover:bg-white/20 transition-all"
                    >
                      <ListIcon className="h-6 w-6" />
                    </Button>
                    <span className="text-[10px] font-bold text-foreground dark:text-white drop-shadow-md uppercase tracking-wider">
                      Filters
                    </span>
                  </div>
                </div>

                {/* Bottom Tracks / Meta Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  {usedTrack && (
                    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 w-fit animate-in fade-in slide-in-from-bottom-2">
                      <div className="relative h-6 w-6 rounded-full overflow-hidden bg-pink-500 flex items-center justify-center">
                        <Music2Icon className="h-3 w-3 text-white animate-pulse" />
                      </div>
                      <span className="text-white text-xs font-medium truncate max-w-[150px]">
                        {usedTrack.title || "Untitled track"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Editor Toolbar */}
            <div className="bg-background/80 dark:bg-black/80 backdrop-blur-xl border-t border-foreground/5 dark:border-white/5 p-4 md:p-6 flex flex-col gap-4 md:gap-6 shrink-0">
              <div className="w-full">
                <Mixer
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  vDuration={vDuration}
                  setVDuration={setVDuration}
                  remPerSec={remPerSec}
                  src={video}
                  usedTrack={usedTrack}
                  videoRef={videoRef as any}
                  duration={duration}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  currentTime={currentTime}
                  setCurrentTime={setCurrentTime}
                />
              </div>

              {/* Zoom Control */}
              <div className="flex items-center gap-4 bg-muted/20 dark:bg-white/5 px-4 py-2 rounded-xl border border-foreground/5 dark:border-white/5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Timeline Zoom</span>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={remPerSec}
                  onChange={(e) => setRemPerSec(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-foreground/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <span className="text-[10px] font-mono text-pink-500 font-bold w-8 text-right">
                  {remPerSec}x
                </span>
              </div>

              {/* Audio Editor Toggle & Section */}
              {usedTrack && (
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className={`w-full h-12 rounded-xl border-foreground/5 dark:border-white/10 flex items-center justify-between px-4 transition-all ${showAudioEditor ? "bg-pink-500/10 border-pink-500/50" : "bg-muted/20 dark:bg-white/5"
                      }`}
                    onClick={() => setShowAudioEditor(!showAudioEditor)}
                  >
                    <div className="flex items-center gap-3">
                      <Music size={16} className={showAudioEditor ? "text-pink-500" : "text-muted-foreground"} />
                      <span className={`text-xs font-bold uppercase tracking-widest ${showAudioEditor ? "text-pink-100" : "text-muted-foreground"}`}>
                        {showAudioEditor ? "Close Audio Editor" : "Trim & Edit Audio"}
                      </span>
                    </div>
                    {showAudioEditor ? (
                      <div className="text-[10px] font-bold text-pink-500 border border-pink-500/30 px-2 py-0.5 rounded-full uppercase">Active</div>
                    ) : (
                      <div className="text-[10px] font-bold text-muted-foreground/50 border border-foreground/5 dark:border-white/10 px-2 py-0.5 rounded-full uppercase">Edit Selection</div>
                    )}
                  </Button>

                  {showAudioEditor && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <AudioWaveform
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                        vDuration={vDuration}
                        setVDuration={setVDuration}
                        isPlaying={isPlaying}
                        data={usedTrack}
                        src={process.env.NEXT_PUBLIC_FILE_SERVER_URL + usedTrack.path}
                        currentTime={currentTime}
                        remPerSec={remPerSec}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  className="text-foreground/60 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-foreground/5 dark:hover:bg-white/5 font-syne font-bold px-6 md:px-8 rounded-full"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("cancel")}
                </Button>

                <Button
                  onClick={(e) => processVideo(e)}
                  disabled={reelLoading}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-syne font-bold px-8 md:px-10 h-10 md:h-12 rounded-full shadow-lg shadow-pink-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:grayscale"
                >
                  {reelLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{t("createReels")}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Music Selection Sheet */}
            <AnimatePresence>
              {showMusicSheet && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col pt-12 md:pt-20"
                >
                  <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border-t border-foreground/10 dark:border-white/10 flex flex-col shadow-2xl overflow-hidden md:rounded-t-[2.5rem]">
                    <div className="w-12 h-1.5 bg-foreground/20 dark:bg-white/20 rounded-full mx-auto my-4 shrink-0 cursor-pointer" onClick={() => setShowMusicSheet(false)} />

                    <div className="px-6 flex items-center justify-between mb-4 shrink-0">
                      <h3 className="text-foreground dark:text-white text-xl font-bold font-syne flex items-center gap-2">
                        <ListMusic className="h-5 w-5 text-pink-500" />
                        {t("selectMusic")}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-foreground/60 dark:text-white/60 hover:text-foreground dark:hover:text-white font-bold"
                        onClick={() => setShowMusicSheet(false)}
                      >
                        {t("done")}
                      </Button>
                    </div>


                    <div className="space-y-6 pb-24 px-6">
                      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 py-4">
                        <MusicUploader
                          userId={userId}
                          refetch={refetch}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                        />
                      </div>

                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                          <Loader2 className="h-10 w-10 text-pink-500 animate-spin" />
                          <p className="text-foreground/40 dark:text-white/40 font-syne text-sm">Loading tracks...</p>
                        </div>
                      ) : (
                        <AudioPlayerList
                          players={allMusic}
                          setUsedTrack={(track: IMusic) => {
                            SetUsedTrack(track);
                          }}
                        />
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <audio ref={audioRef} className="hidden" />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
