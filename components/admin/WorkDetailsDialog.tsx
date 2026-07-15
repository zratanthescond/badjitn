"use client";

import {
  CheckCheck,
  Download,
  Eye,
  FileText,
  Upload,
  Sparkles,
  User,
  ThumbsUp,
  ThumbsDown,
  XCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { extractFileDetails } from "@/lib/utils";
import { FaFilePdf, FaFileWord, FaFileImage, FaFile } from "react-icons/fa";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";

const FileViewer = dynamic(() => import("react-file-viewer"), {
  ssr: false,
});

export function WorkDetailsDialog({ value }: { value: any }) {
  const t = useTranslations("workDetailsDialog");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const fileViewerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const summaryStatus = value?.summaryStatus ?? value?.status ?? "submitted";
  const isApproved = summaryStatus === "approved";
  const isRejected = summaryStatus === "rejected";
  const isPendingRegistration = value?.isPendingRegistration === true;

  if (!value) {
    return null;
  }

  const getFileIcon = (extension: string) => {
    switch (extension?.toLowerCase()) {
      case "pdf":
        return <FaFilePdf className="h-4 w-4 text-red-500" />;
      case "doc":
      case "docx":
        return <FaFileWord className="h-4 w-4 text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FaFileImage className="h-4 w-4 text-green-500" />;
      default:
        return <FaFile className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleApprove = async () => {
    if (!value._id) return;
    setIsApproving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/work/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workId: value._id }),
        }
      );
      const data = await res.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["works"] });
        toast({
          title: t("approve.toastTitle"),
          description: t("approve.toastDescription"),
        });
      } else {
        toast({
          title: t("approve.toastErrorTitle"),
          description: data.error || "",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: t("approve.toastErrorTitle"),
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!value._id) return;
    setIsRejecting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/work/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workId: value._id, reason: rejectionReason }),
        }
      );
      const data = await res.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["works"] });
        toast({
          title: t("reject.toastTitle"),
          description: t("reject.toastDescription"),
        });
        setIsRejectDialogOpen(false);
        setRejectionReason("");
      } else {
        toast({
          title: t("reject.toastErrorTitle"),
          description: data.error || "",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: t("reject.toastErrorTitle"),
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  // Function to try and force scrollbar visibility and ensure height
  const adjustFileViewerScroll = () => {
    if (fileViewerRef.current) {
      const viewerDiv = fileViewerRef.current;
      // Find the actual iframe or div within react-file-viewer that holds the content
      // This is highly dependent on react-file-viewer's internal DOM structure
      // For PDFs, it's usually an iframe. For images, it might be an img tag or a div.

      // Common selector for the content area within react-file-viewer
      // You might need to inspect the DOM for the exact class/tag
      const contentElement =
        viewerDiv.querySelector("iframe") ||
        viewerDiv.querySelector(".pg-viewer-wrapper > div");

      if (contentElement) {
        // Ensure the content element itself has overflow and height properties
        contentElement.style.height = "100%"; // Make it take full height of its container
        contentElement.style.overflow = "auto"; // Ensure it can scroll if content overflows
        contentElement.style.display = "block"; // Ensure it behaves like a block for height/overflow
      }

      // Ensure the direct parent of FileViewer also enforces scrolling if FileViewer itself doesn't
      // This is a fallback if FileViewer's internal elements don't respond as expected.
      viewerDiv.style.overflow = "auto";
    }
  };

  // Call adjustFileViewerScroll whenever the active file changes
  useEffect(() => {
    // A small delay might be necessary for the FileViewer to fully render its content
    const timer = setTimeout(adjustFileViewerScroll, 100);
    return () => clearTimeout(timer);
  }, [value.fileUrls]); // Re-run effect when fileUrls (and thus selected file) changes

  return (
    <div className={`flex w-full items-center justify-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
      {isPendingRegistration && (
        <Badge className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-full text-xs font-semibold">
          {t("status.pending")}
        </Badge>
      )}
      {!isApproved && !isRejected && !isPendingRegistration && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-300 rounded-full transition-all duration-200 hover:scale-105"
          >
            {isApproving ? (
              <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mr-2" />
            ) : (
              <ThumbsUp className="w-4 h-4 text-green-500 mr-2" />
            )}
            <span className={isRTL ? "font-arabic" : ""}>{t("approve.button")}</span>
          </Button>

          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isApproving || isRejecting}
                className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-300 rounded-full transition-all duration-200 hover:scale-105"
              >
                <ThumbsDown className="w-4 h-4 text-red-500 mr-2" />
                <span className={isRTL ? "font-arabic" : ""}>{t("reject.button")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className={isRTL ? "rtl text-right" : ""}>
              <DialogHeader>
                <DialogTitle className={isRTL ? "font-arabic" : ""}>
                  {t("reject.dialogTitle")}
                </DialogTitle>
                <DialogDescription className={isRTL ? "font-arabic" : ""}>
                  {t("reject.dialogDescription")}
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t("reject.reasonPlaceholder")}
                className={isRTL ? "font-arabic text-right" : ""}
                rows={4}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(false)}
                  disabled={isRejecting}
                >
                  <span className={isRTL ? "font-arabic" : ""}>{t("reject.cancel")}</span>
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isRejecting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isRejecting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  <span className={isRTL ? "font-arabic" : ""}>{t("reject.confirm")}</span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
      {isApproved && (
        <Badge className="bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-semibold">
          <CheckCheck className="w-3.5 h-3.5 mr-1" />
          {t("status.approved")}
        </Badge>
      )}
      {isRejected && (
        <Badge className="bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full text-xs font-semibold">
          <XCircle className="w-3.5 h-3.5 mr-1" />
          {t("status.rejected")}
        </Badge>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0 rounded-full py-1.5 px-4 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            {t("viewButton")}
          </Button>
        </DialogTrigger>

        <DialogContent
          className={`glass bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl w-full min-w-[90vw] max-w-[95vw] max-h-[95vh] m-4 shadow-2xl ${
            isRTL ? "rtl" : "ltr"
          }`}
        >
          <DialogHeader className="space-y-4">
            <div
              className={`flex items-center gap-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20">
                <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <DialogTitle
                  className={`text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("title")}
                </DialogTitle>
                <DialogDescription
                  className={`text-lg text-muted-foreground mt-2 ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("description")}
                </DialogDescription>
              </div>
            </div>

            {/* Work Status Badge */}
            <div
              className={`flex items-center gap-3 flex-wrap ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Badge
                variant="outline"
                className={
                  isApproved
                    ? "glass bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300"
                    : isRejected
                    ? "glass bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                    : "glass bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
                }
              >
                <Sparkles className="h-3 w-3 mr-1" />
                <span className={isRTL ? "font-arabic" : ""}>
                  {isApproved
                    ? t("status.approved")
                    : isRejected
                    ? t("status.rejected")
                    : t("status.submitted")}
                </span>
              </Badge>
              {value.submittedAt && (
                <span
                  className={`text-sm text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("submittedOn")}:{" "}
                  {new Date(value.submittedAt).toLocaleDateString(locale)}
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[70vh] pr-4">
              <div
                className={`flex flex-col gap-6 ${
                  isRTL ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Title & Client Info */}
                {(value.title || value.clientInfo) && (
                  <Card className="glass bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/20 border border-slate-200/30 dark:border-slate-700/30">
                    <CardHeader className="pb-2">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-slate-500/20">
                          <User className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                            {value.title || t("clientInfo.title")}
                          </CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {t("clientInfo.description")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    {value.clientInfo && (
                      <CardContent className="pt-0">
                        <div
                          className={`grid grid-cols-2 gap-2 text-sm ${
                            isRTL ? "text-right" : ""
                          }`}
                        >
                          {(value.clientInfo.firstName || value.clientInfo.lastName) && (
                            <p>
                              <span className="text-muted-foreground">{t("clientInfo.name")}: </span>
                              {[value.clientInfo.firstName, value.clientInfo.lastName].filter(Boolean).join(" ").trim()}
                            </p>
                          )}
                          {value.clientInfo.jobTitle && (
                            <p>
                              <span className="text-muted-foreground">{t("clientInfo.jobTitle")}: </span>
                              {value.clientInfo.jobTitle}
                            </p>
                          )}
                          {value.clientInfo.republic && (
                            <p>
                              <span className="text-muted-foreground">{t("clientInfo.republic")}: </span>
                              {value.clientInfo.republic}
                            </p>
                          )}
                          {(value.clientInfo.city || value.clientInfo.village) && (
                            <p>
                              <span className="text-muted-foreground">{t("clientInfo.location")}: </span>
                              {[value.clientInfo.city, value.clientInfo.village].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Rejection Reason */}
                {isRejected && value.rejectionReason && (
                  <Card className="glass bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur-sm border border-red-200/30 dark:border-red-700/30">
                    <CardHeader className="pb-2">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-red-500/20">
                          <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle
                            className={`text-lg text-red-800 dark:text-red-200 ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("reject.reasonCardTitle")}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p
                        className={`text-sm text-red-700 dark:text-red-300 ${
                          isRTL ? "font-arabic text-right" : ""
                        }`}
                      >
                        {value.rejectionReason}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Written Note / Résumé Section */}
                {value.note && value.note.length > 0 && (
                  <Card className="glass bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30 flex-1">
                    <CardHeader className="pb-4">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle
                            className={`text-xl text-purple-800 dark:text-purple-200 ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("writtenNote.title")}
                          </CardTitle>
                          <p
                            className={`text-sm text-purple-600 dark:text-purple-300 ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("writtenNote.description")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="glass bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-xl p-6">
                        <ScrollArea className="max-h-96">
                          <div
                            className={`prose prose-sm dark:prose-invert max-w-none ${
                              isRTL ? "prose-rtl font-arabic" : ""
                            }`}
                            dangerouslySetInnerHTML={{ __html: value.note }}
                          />
                          <ScrollBar orientation="vertical" />
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Uploaded Files Section */}
                {value.fileUrls && value.fileUrls.length > 0 && (
                  <Card className="glass md:max-w-screen-md bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30 flex-1">
                    <CardHeader className="pb-4">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle
                            className={`text-xl text-green-800 dark:text-green-200 ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("uploadedFiles.title")}
                          </CardTitle>
                          <p
                            className={`text-sm text-green-600 dark:text-green-300 ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("uploadedFiles.description", {
                              count: value.fileUrls.length,
                            })}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Tabs defaultValue={value.fileUrls[0]} className="w-full">
                        <ScrollArea className="w-full">
                          <TabsList
                            className={`glass bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-slate-600/50 rounded-2xl p-2 flex w-max gap-2 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                          >
                            {value.fileUrls.map(
                              (file: string, index: number) => {
                                const fileDetails = extractFileDetails(file);
                                return (
                                  <TabsTrigger
                                    key={index}
                                    value={file}
                                    className={`glass bg-white/60 dark:bg-slate-600/60 backdrop-blur-sm border border-white/30 dark:border-slate-500/50 rounded-xl transition-all duration-200 hover:scale-105 data-[state=active]:bg-white/90 data-[state=active]:dark:bg-slate-500/90 data-[state=active]:shadow-lg ${
                                      isRTL
                                        ? "flex-row-reverse font-arabic"
                                        : ""
                                    }`}
                                  >
                                    {getFileIcon(fileDetails?.extension)}
                                    <span className="ml-2 truncate max-w-32">
                                      {fileDetails?.name}
                                    </span>
                                  </TabsTrigger>
                                );
                              }
                            )}
                          </TabsList>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        {value.fileUrls.map((file: string, index: number) => (
                          <TabsContent
                            key={index}
                            value={file}
                            className="mt-6 space-y-4"
                          >
                            <div className="glass bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-xl p-4">
                              {/* Container for FileViewer to enforce height and overflow */}
                              <div
                                ref={fileViewerRef}
                                className="h-[50vh] w-full overflow-auto rounded-lg"
                              >
                                <FileViewer
                                  key={file} // IMPORTANT: Add a key to force re-render when file changes
                                  fileType={
                                    extractFileDetails(file)?.extension || ""
                                  }
                                  filePath={file}
                                  // Remove direct className styles that might conflict with the parent div
                                  // and let the parent div manage the overall viewer height and overflow
                                  className="!w-full !h-full" // Ensure it takes 100% of its parent div's height
                                  onError={() => (
                                    <div className="flex flex-col items-center justify-center p-8 text-center h-full w-full">
                                      {" "}
                                      {/* h-full here */}
                                      <FaFile className="h-16 w-16 text-muted-foreground mb-4" />
                                      <p
                                        className={`text-muted-foreground ${
                                          isRTL ? "font-arabic" : ""
                                        }`}
                                      >
                                        {t("filePreview.error")}
                                      </p>
                                      <p
                                        className={`text-muted-foreground text-sm mt-2 ${
                                          isRTL ? "font-arabic" : ""
                                        }`}
                                      >
                                        {t("filePreview.unsupported")}
                                      </p>
                                    </div>
                                  )}
                                />
                              </div>

                              <div
                                className={`flex justify-between items-center mt-4 ${
                                  isRTL ? "flex-row-reverse" : ""
                                }`}
                              >
                                <div
                                  className={`flex items-center gap-2 ${
                                    isRTL ? "flex-row-reverse" : ""
                                  }`}
                                >
                                  {getFileIcon(
                                    extractFileDetails(file)?.extension
                                  )}
                                  <span
                                    className={`text-sm font-medium ${
                                      isRTL ? "font-arabic" : ""
                                    }`}
                                  >
                                    {extractFileDetails(file)?.name}
                                  </span>
                                </div>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full transition-all duration-200 hover:scale-105"
                                  asChild
                                >
                                  <Link
                                    href={file}
                                    rel="preload"
                                    target="_blank"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    <span
                                      className={isRTL ? "font-arabic" : ""}
                                    >
                                      {t("downloadButton")}
                                    </span>
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Empty State */}
              {(!value.note || value.note.length === 0) &&
                (!value.fileUrls || value.fileUrls.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-muted/20 mb-4">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("emptyState.title")}
                    </h3>
                    <p
                      className={`text-muted-foreground max-w-md ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("emptyState.description")}
                    </p>
                  </div>
                )}

              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
