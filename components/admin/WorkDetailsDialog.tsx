"use client";

import {
  CheckCheck,
  Download,
  Eye,
  FileText,
  Upload,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { extractFileDetails } from "@/lib/utils";
import { FaFilePdf, FaFileWord, FaFileImage, FaFile } from "react-icons/fa";
import Link from "next/link";

import { useTranslations, useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react"; // Import useRef and useEffect
import dynamic from "next/dynamic";

const FileViewer = dynamic(() => import("react-file-viewer"), {
  ssr: false, // This is critical
});
export function WorkDetailsDialog({ value }: { value: any }) {
  const t = useTranslations("workDetailsDialog");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [isMarkingAsSeen, setIsMarkingAsSeen] = useState(false);
  const fileViewerRef = useRef(null); // Ref to the FileViewer container

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

  const handleMarkAsSeen = async () => {
    setIsMarkingAsSeen(true);
    // Simulate API call
    setTimeout(() => {
      setIsMarkingAsSeen(false);
    }, 1000);
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
    <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleMarkAsSeen}
        disabled={isMarkingAsSeen}
        className="glass bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-500/20 rounded-full transition-all duration-200 hover:scale-105"
      >
        {isMarkingAsSeen ? (
          <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mr-2" />
        ) : (
          <CheckCheck className="w-4 h-4 text-green-500 mr-2" />
        )}
        <span className={isRTL ? "font-arabic" : ""}>{t("markAsSeen")}</span>
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className={`glass bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 rounded-full transition-all duration-200 hover:scale-105 ${
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
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Badge
                variant="outline"
                className="glass bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                <span className={isRTL ? "font-arabic" : ""}>
                  {t("status.submitted")}
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
                className={`flex flex-col lg:flex-row gap-6 ${
                  isRTL ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Written Note Section */}
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
