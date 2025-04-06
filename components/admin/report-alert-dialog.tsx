"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  UserX,
  EyeOff,
  AlertTriangle,
  User,
  Clock,
  Flag,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  X,
  XOctagon,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn, formatDateTime } from "@/lib/utils";

// This would come from your database
interface ReportedEvent {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  date: string;
  reportReason: string;
  reportedBy: string;
  reportedAt: string;
  severity?: "low" | "medium" | "high";
}

interface ReportAlertDialogProps {
  event: ReportedEvent;
  isOpen: boolean;
  onClose: () => void;
  onDiscardReport: (eventId: string) => Promise<void>;
  onHideEvent: (eventId: string) => Promise<void>;
  onBanCreator: (creatorId: string) => Promise<void>;
  refetch: () => void;
}

export function ReportAlertDialog({
  event,
  isOpen,
  onClose,
  onDiscardReport,
  onHideEvent,
  onBanCreator,
  refetch,
}: ReportAlertDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmBan, setConfirmBan] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const handleDiscardReport = async () => {
    setIsLoading(true);
    setActiveAction("discard");

    try {
      await onDiscardReport(event._id);
      refetch();
      onClose();
    } catch (error) {
      console.error("Failed to discard report:", error);
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleHideEvent = async () => {
    setIsLoading(true);
    setActiveAction("hide");
    try {
      await onHideEvent(event?.eventId?._id);
      refetch();
      onClose();
    } catch (error) {
      console.error("Failed to hide event:", error);
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleBanCreator = async () => {
    if (!confirmBan) {
      setConfirmBan(true);
      return;
    }

    setIsLoading(true);
    setActiveAction("ban");
    try {
      await onBanCreator(event?.eventId?._id);
      refetch();
      onClose();
    } catch (error) {
      console.error("Failed to ban creator:", error);
    } finally {
      setIsLoading(false);
      setConfirmBan(false);
      setActiveAction(null);
    }
  };

  const getSeverityColor = (severity = "medium") => {
    switch (severity) {
      case "low":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getSeverityIcon = (severity = "medium") => {
    switch (severity) {
      case "low":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "high":
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm rounded-full"
        >
          View Report
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl sm:rounded-xl rounded-t-xl w-full sm:w-auto max-h-[90vh] sm:max-h-[85vh] flex flex-col glass backdrop-blur-sm">
        <AlertDialogCancel asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 z-50 p-0 text-white  rounded-full"
          >
            <X className=" h-8 w-8 text-lg" />
          </Button>
        </AlertDialogCancel>
        <div className="bg-gradient-to-r from-violet-500/90 via-purple-500/90 to-indigo-500/90 p-5 sm:p-6 flex-shrink-0 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white/10"></div>
          </div>

          <AlertDialogHeader className="mb-2 relative text-white z-10">
            <AlertDialogTitle className="flex items-center gap-2 text-lg sm:text-xl ">
              <AlertTriangle className="h-5 w-5" />
              <span>Reported Event</span>
            </AlertDialogTitle>
            <AlertDialogDescription className=" text-sm text-white sm:text-base">
              Review the reported event and take appropriate action.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Badge
            variant="outline"
            className={`${getSeverityColor(
              event.severity
            )} mt-2 mb-1 relative z-10 border-2 font-medium shadow-sm`}
          >
            {getSeverityIcon(event.severity)}
            <span className="ml-1">{event.severity || "Medium"} Severity</span>
          </Badge>
        </div>

        {/* Use a div with overflow-auto instead of ScrollArea for the dialog */}
        <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-5 sm:p-6">
            <Card className="border border-gray-200/50 shadow-md bg-card rounded-xl overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-0">
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg tracking-tight ">
                        {event?.eventId?.title}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-1.5 mt-1.5">
                        <CalendarIcon className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <span>{formatDateTime(event?.createdAt).dateTime}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-card-foreground/30">
                      <div className="mt-0.5 bg-indigo-100 text-indigo-700 p-1.5 rounded-md flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium ">Creator</div>
                        <div className="text-sm break-words ">
                          {event?.eventId?.organizer?.firstName}{" "}
                          {event?.eventId?.organizer?.lastName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-card-foreground/30">
                      <div className="mt-0.5 bg-red-100 text-red-700 p-1.5 rounded-md flex-shrink-0">
                        <Flag className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium ">
                          Report reason
                        </div>
                        <div className="text-sm break-words">{event.cause}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-card-foreground/30">
                      <div className="mt-0.5 bg-amber-100 text-amber-700 p-1.5 rounded-md flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium ">Reported by</div>
                        <div className="text-sm break-words ">
                          {event?.userId?.firstName} {event?.userId?.lastName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-card-foreground/30">
                      <div className="mt-0.5 bg-teal-100 text-teal-700 p-1.5 rounded-md flex-shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium ">Reported at</div>
                        <div className="text-sm ">
                          {formatDateTime(event?.createdAt).dateTime}
                        </div>
                      </div>
                    </div>

                    {/* Add more content to ensure scrolling is needed */}
                    <div className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-card-foreground/30">
                      <div className="mt-0.5 bg-purple-100 text-purple-700 p-1.5 rounded-md flex-shrink-0">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium ">
                          Additional Information
                        </div>
                        <div className="text-sm break-words ">
                          This report has been flagged for review by our
                          moderation team. Please review all details carefully
                          before taking action.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <pre>
                  <code>{JSON.stringify(event, null, 2)}</code>
                </pre> */}
              </CardContent>
            </Card>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className={cn(
                  "transition-all duration-200 border-2 font-medium rounded-full",
                  activeAction === "discard" ? "bg-gray-100" : ""
                )}
                onClick={handleDiscardReport}
                disabled={isLoading}
              >
                {isLoading && activeAction === "discard" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing</span>
                  </span>
                ) : (
                  <>
                    <XOctagon className="mr-2 h-4 w-4 " />
                    <span>Discard</span>
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                className={cn(
                  "bg-amber-50 rounded-full text-amber-700 hover:bg-amber-100 border-2 border-amber-200 transition-all duration-200 font-medium",
                  activeAction === "hide" ? "bg-amber-100" : ""
                )}
                onClick={handleHideEvent}
                disabled={isLoading}
              >
                {isLoading && activeAction === "hide" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing</span>
                  </span>
                ) : (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    <span>Hide Event</span>
                  </>
                )}
              </Button>

              <Button
                variant="destructive"
                className={cn(
                  "transition-all duration-200 font-medium border-2 border-transparent rounded-full",
                  confirmBan ? "bg-red-700 hover:bg-red-800" : "",
                  activeAction === "ban" ? "bg-red-800" : ""
                )}
                onClick={handleBanCreator}
                disabled={isLoading && activeAction !== "ban"}
              >
                {isLoading && activeAction === "ban" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing</span>
                  </span>
                ) : confirmBan ? (
                  <>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>Confirm Ban</span>
                  </>
                ) : (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    <span>Ban Creator</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
