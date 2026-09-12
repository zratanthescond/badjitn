"use client";

import {
  CheckCheck,
  Download,
  Eye,
  FileText,
  Upload,
  Sparkles,
  User,
  Users,
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
          body: JSON.stringify(
            isPendingRegistration
              ? { orderId: value._id }
              : { workId: value._id }
          ),
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
          body: JSON.stringify(
            isPendingRegistration
              ? { orderId: value._id, reason: rejectionReason }
              : { workId: value._id, reason: rejectionReason }
          ),
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

  // Order-only pending entries beyond the first résumé have no independent
  // EventWork document to review yet — approving/rejecting would act on the
  // order's first résumé instead. Keep them visible for content, not review.
  const canReview = value?.canReview !== false;

  return (
    <div className={`flex w-full items-center justify-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
      {canReview && !isApproved && !isRejected && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="rounded-full border-admin-success/30 bg-admin-success-soft text-admin-success hover:bg-admin-success-soft/70"
          >
            {isApproving ? (
              <div className="w-4 h-4 border-2 border-admin-success/30 border-t-admin-success rounded-full animate-spin mr-2" />
            ) : (
              <ThumbsUp className="w-4 h-4 mr-2" />
            )}
            <span className={isRTL ? "font-arabic" : ""}>{t("approve.button")}</span>
          </Button>

          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isApproving || isRejecting}
                className="rounded-full border-destructive/30 bg-admin-critical-soft text-destructive hover:bg-admin-critical-soft/70"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
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
                  variant="destructive"
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
        <Badge className="bg-admin-success-soft border border-admin-success/30 text-admin-success px-3 py-1.5 rounded-full text-xs font-semibold">
          <CheckCheck className="w-3.5 h-3.5 mr-1" />
          {t("status.approved")}
        </Badge>
      )}
      {isRejected && (
        <Badge className="bg-admin-critical-soft border border-destructive/30 text-destructive px-3 py-1.5 rounded-full text-xs font-semibold">
          <XCircle className="w-3.5 h-3.5 mr-1" />
          {t("status.rejected")}
        </Badge>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className={`rounded-full py-1.5 px-4 ${isRTL ? "font-arabic" : ""}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            {t("viewButton")}
          </Button>
        </DialogTrigger>

        <DialogContent
          className={`w-full min-w-[90vw] max-w-[95vw] max-h-[95vh] m-4 rounded-2xl border border-border bg-card shadow-2xl ${
            isRTL ? "rtl" : "ltr"
          }`}
        >
          <DialogHeader className="space-y-4">
            <div
              className={`flex items-center gap-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="p-3 rounded-xl bg-admin-accent-soft">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <DialogTitle
                  className={`text-2xl font-bold text-foreground ${
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
                    ? "bg-admin-success-soft border-admin-success/30 text-admin-success"
                    : isRejected
                    ? "bg-admin-critical-soft border-destructive/30 text-destructive"
                    : "bg-admin-accent-soft border-primary/30 text-admin-accent-soft-foreground"
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
                  <Card className="border border-border bg-muted/40">
                    <CardHeader className="pb-2">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-muted">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle className="text-lg text-foreground">
                            {value.title || t("clientInfo.title")}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
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
                  <Card className="border border-destructive/25 bg-admin-critical-soft/60">
                    <CardHeader className="pb-2">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-admin-critical-soft">
                          <XCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle
                            className={`text-lg text-destructive ${
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
                        className={`text-sm text-destructive/90 ${
                          isRTL ? "font-arabic text-right" : ""
                        }`}
                      >
                        {value.rejectionReason}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Structured abstract sections (Introduction, Résultats, ...) */}
                {value.sections && value.sections.length > 0 && (
                  <Card className="flex-1 border border-border bg-admin-accent-soft/40">
                    <CardHeader className="pb-4">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-admin-accent-soft">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle
                            className={`text-xl text-foreground ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("sections.title")}
                          </CardTitle>
                          <p
                            className={`text-sm text-muted-foreground ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("sections.description")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {value.sections.map((section: { label: string; content: string }, index: number) => (
                        <div
                          key={index}
                          className="rounded-xl border border-border bg-card p-6"
                        >
                          <h4
                            className={`text-sm font-semibold text-primary mb-2 ${
                              isRTL ? "font-arabic text-right" : ""
                            }`}
                          >
                            {section.label}
                          </h4>
                          <ScrollArea className="max-h-72">
                            <p
                              className={`text-sm whitespace-pre-line leading-relaxed ${
                                isRTL ? "font-arabic text-right" : ""
                              }`}
                            >
                              {section.content}
                            </p>
                            <ScrollBar orientation="vertical" />
                          </ScrollArea>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Co-authors */}
                {((value.coAuthors && value.coAuthors.length > 0) || value.clientInfo?.coAuthors) && (
                  <Card className="border border-border bg-muted/40">
                    <CardHeader className="pb-2">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-muted">
                          <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <CardTitle
                          className={`text-lg text-foreground ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          {t("coAuthors.title")}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className={`text-sm ${isRTL ? "font-arabic text-right" : ""}`}>
                        {value.coAuthors && value.coAuthors.length > 0
                          ? value.coAuthors
                              .map((c: { firstName?: string; lastName?: string; affiliation?: string }) =>
                                [
                                  [c.firstName, c.lastName].filter(Boolean).join(" "),
                                  c.affiliation ? `(${c.affiliation})` : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")
                              )
                              .join(", ")
                          : value.clientInfo?.coAuthors}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Written Note / Résumé Section — skipped when structured sections
                    above already show the same content in a clearer format. */}
                {!(value.sections && value.sections.length > 0) && value.note && value.note.length > 0 && (
                  <Card className="flex-1 border border-border bg-admin-accent-soft/40">
                    <CardHeader className="pb-4">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-admin-accent-soft">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle
                            className={`text-xl text-foreground ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("writtenNote.title")}
                          </CardTitle>
                          <p
                            className={`text-sm text-muted-foreground ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("writtenNote.description")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-xl border border-border bg-card p-6">
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

                {/* Abstract document(s) — uploaded alongside the résumé, available
                    before approval (distinct from the final e-poster below). */}
                {value.abstractFileUrls && value.abstractFileUrls.length > 0 && (
                  <Card className="flex-1 border border-admin-warning/20 bg-admin-warning-soft/50">
                    <CardHeader className="pb-4">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-admin-warning-soft">
                          <FileText className="h-6 w-6 text-admin-warning" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle
                            className={`text-xl text-foreground ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("abstractFiles.title")}
                          </CardTitle>
                          <p
                            className={`text-sm text-muted-foreground ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("abstractFiles.description", {
                              count: value.abstractFileUrls.length,
                            })}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {value.abstractFileUrls.map((file: string, index: number) => {
                        const fileDetails = extractFileDetails(file);
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div
                              className={`flex items-center gap-2 min-w-0 ${
                                isRTL ? "flex-row-reverse" : ""
                              }`}
                            >
                              {getFileIcon(fileDetails?.extension)}
                              <span className="text-sm font-medium truncate">
                                {fileDetails?.name}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full shrink-0"
                              asChild
                            >
                              <Link href={file} rel="preload" target="_blank">
                                <Download className="w-4 h-4 mr-2" />
                                <span className={isRTL ? "font-arabic" : ""}>
                                  {t("downloadButton")}
                                </span>
                              </Link>
                            </Button>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Uploaded Files Section */}
                {value.fileUrls && value.fileUrls.length > 0 && (
                  <Card className="md:max-w-screen-md flex-1 border border-admin-success/20 bg-admin-success-soft/50">
                    <CardHeader className="pb-4">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-admin-success-soft">
                          <Upload className="h-6 w-6 text-admin-success" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle
                            className={`text-xl text-foreground ${
                              isRTL ? "font-arabic" : ""
                            }`}
                          >
                            {t("uploadedFiles.title")}
                          </CardTitle>
                          <p
                            className={`text-sm text-muted-foreground ${
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
                            className={`bg-muted border border-border rounded-2xl p-2 flex w-max gap-2 ${
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
                                    className={`rounded-xl border border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:shadow-sm ${
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
                            <div className="rounded-xl border border-border bg-card p-4">
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
                                  className="rounded-full"
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
                (!value.sections || value.sections.length === 0) &&
                (!value.fileUrls || value.fileUrls.length === 0) &&
                (!value.abstractFileUrls || value.abstractFileUrls.length === 0) && (
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
