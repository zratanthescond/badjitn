"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Edit3,
  Upload,
  File,
  Eye,
  User,
  ImageIcon,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { MinimalTiptapEditor } from "../minimal-tiptap";
import { Skeleton } from "../ui/skeleton";
import type { Content } from "@tiptap/react";
import {
  useSubmitWorkSummary,
  useUploadWorkImage,
  type ClientInfo,
} from "@/hooks/useUploadWork";
import { toast } from "@/hooks/use-toast";
import { useGetWork } from "@/hooks/useGetWork";
import UploadedFileController from "./UploadedFileController";
import { extractFileDetails } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import dynamic from "next/dynamic";

const FileViewer = dynamic(() => import("react-file-viewer"), {
  ssr: false,
});

const defaultClientInfo: ClientInfo = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  republic: "",
  city: "",
  village: "",
};

function isClientInfoEmpty(info: ClientInfo) {
  return Object.values(info).every((v) => !String(v ?? "").trim());
}

export default function WorkUploader({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  const t = useTranslations("WorkUploader");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const { data, isLoading, refetch } = useGetWork(eventId, userId);
  const work = data?.success ? data.works : null;
  const summaryStatus = work?.summaryStatus ?? "draft";
  const isLegacyWork = work && work.summaryStatus === undefined;
  const isApproved = summaryStatus === "approved" || isLegacyWork;

  const [title, setTitle] = useState(work?.title || "");
  const [clientInfo, setClientInfo] = useState<ClientInfo>(
    work?.clientInfo || defaultClientInfo
  );
  const [note, setNote] = useState<Content>(work?.note || "");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [clientInfoTouched, setClientInfoTouched] = useState(false);

  const didInitFromWorkRef = useRef(false);
  const clientInfoTouchedRef = useRef(false);
  useEffect(() => {
    clientInfoTouchedRef.current = clientInfoTouched;
  }, [clientInfoTouched]);

  const submitSummaryMutation = useSubmitWorkSummary();
  const uploadImageMutation = useUploadWorkImage();

  useEffect(() => {
    if (!userId) return;
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users?userId=${encodeURIComponent(userId)}`
    )
      .then((res) => res.json())
      .then((user: Record<string, string> | null) => {
        if (!user) return;
        // Prefill only when the user hasn't started editing.
        if (clientInfoTouchedRef.current) return;
        setClientInfo((prev) => {
          if (clientInfoTouchedRef.current) return prev;
          if (!isClientInfoEmpty(prev)) return prev;
          if (work?.clientInfo) return prev;
          return {
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            jobTitle: user.jobTitle ?? "",
            republic: user.republic ?? "",
            city: user.city ?? "",
            village: user.village ?? "",
          };
        });
      })
      .catch(() => {});
  }, [userId, work?.clientInfo]);

  useEffect(() => {
    if (!work || didInitFromWorkRef.current) return;
    didInitFromWorkRef.current = true;

    // Initialize from saved work only once, without overwriting user input.
    if (!title.trim() && work.title) setTitle(work.title);
    if (!clientInfoTouchedRef.current && isClientInfoEmpty(clientInfo) && work.clientInfo) {
      setClientInfo(work.clientInfo as ClientInfo);
    }
    if (typeof note === "string" && !note.trim() && work.note) {
      setNote(work.note as Content);
    }
  }, [work, title, clientInfo, note]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    const { extension } = extractFileDetails(selectedFile.name);
    setFileType(extension);
    setError(null);
    setTimeout(() => setUploadProgress(0), 2000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const getNoteAsString = (): string => {
    if (typeof note === "string") return note;
    return "";
  };

  const handleSubmitSummary = () => {
    setError(null);
    const noteStr = getNoteAsString().trim() || "";
    submitSummaryMutation.mutate(
      {
        eventId,
        userId,
        title: title.trim() || "Sans titre",
        clientInfo,
        note: noteStr,
      },
      {
        onSuccess: () => {
          refetch();
          toast({
            title: t("messages.summarySubmitted"),
            description: t("messages.summarySubmittedDescription"),
          });
        },
        onError: (err: Error) => {
          setError(err.message);
          toast({
            title: t("messages.error"),
            description: err.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUploadImage = () => {
    if (!file) return;
    setError(null);
    uploadImageMutation.mutate(
      { file, eventId, userId },
      {
        onSuccess: () => {
          setFile(null);
          setPreviewUrl(null);
          setUploadProgress(0);
          refetch();
          toast({
            title: t("messages.uploadSuccess"),
            description: t("messages.uploadSuccessDescription"),
          });
        },
        onError: (err: Error) => {
          setError(err.message);
          toast({
            title: t("messages.error"),
            description: err.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const getFileIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <ImageIcon className="h-5 w-5 text-green-500 dark:text-green-400" />;
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const noteContent = typeof note === "string" ? note : "";
  const canSubmitSummary =
    (title.trim().length > 0 || noteContent.trim().length > 0) &&
    !submitSummaryMutation.isPending;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-muted-foreground text-lg">{t("description")}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="w-full h-64 rounded-xl" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Summary submission: titre, client info, résumé */}
            <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden group hover:shadow-3xl transition-all duration-300">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20">
                    <Edit3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {t("summary.title")}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t("summary.description")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="work-title">{t("summary.fields.title")}</Label>
                  <Input
                    id="work-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("summary.placeholderTitle")}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t("summary.fields.clientInfo")}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 border">
                    <div className="space-y-1">
                      <Label className="text-xs">{t("summary.fields.firstName")}</Label>
                      <Input
                        value={clientInfo.firstName ?? ""}
                        onChange={(e) =>
                          (setClientInfoTouched(true),
                          setClientInfo((prev) => ({ ...prev, firstName: e.target.value })))
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("summary.fields.lastName")}</Label>
                      <Input
                        value={clientInfo.lastName ?? ""}
                        onChange={(e) =>
                          (setClientInfoTouched(true),
                          setClientInfo((prev) => ({ ...prev, lastName: e.target.value })))
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs">{t("summary.fields.jobTitle")}</Label>
                      <Input
                        value={clientInfo.jobTitle ?? ""}
                        onChange={(e) =>
                          (setClientInfoTouched(true),
                          setClientInfo((prev) => ({ ...prev, jobTitle: e.target.value })))
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("summary.fields.republic")}</Label>
                      <Input
                        value={clientInfo.republic ?? ""}
                        onChange={(e) =>
                          (setClientInfoTouched(true),
                          setClientInfo((prev) => ({ ...prev, republic: e.target.value })))
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("summary.fields.city")}</Label>
                      <Input
                        value={clientInfo.city ?? ""}
                        onChange={(e) =>
                          (setClientInfoTouched(true),
                          setClientInfo((prev) => ({ ...prev, city: e.target.value })))
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">{t("summary.fields.village")}</Label>
                      <Input
                        value={clientInfo.village ?? ""}
                        onChange={(e) =>
                          (setClientInfoTouched(true),
                          setClientInfo((prev) => ({ ...prev, village: e.target.value })))
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("notes.title")}</Label>
                  <p className="text-xs text-muted-foreground">{t("notes.description")}</p>
                  <ScrollArea className="border-2 border-border rounded-xl focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200">
                    <MinimalTiptapEditor
                      placeholder={t("notes.placeholder")}
                      className="min-h-[280px] bg-background"
                      value={note}
                      onChange={setNote}
                      editorContentClassName="p-4"
                      output="html"
                      editable={!isApproved}
                      textOnly
                      content={note}
                      editorProps={{
                        attributes: {
                          spellcheck: "true",
                          class:
                            "prose prose-sm dark:prose-invert focus:outline-none max-w-none",
                        },
                      }}
                    />
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {!isApproved && (
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    disabled={!canSubmitSummary}
                    onClick={handleSubmitSummary}
                  >
                    {submitSummaryMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader className="h-5 w-5 animate-spin" />
                        {t("actions.savingNotes")}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        {t("actions.saveNotes")}
                      </div>
                    )}
                  </Button>
                )}

                {summaryStatus === "submitted" && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    {t("messages.waitingApproval")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image upload: visible only after approval */}
            <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden group hover:shadow-3xl transition-all duration-300">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/20">
                    <UploadCloud className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {t("upload.title")}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t("upload.description")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {!isApproved ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-muted/30 border border-dashed">
                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">
                      {t("upload.unlockMessage")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("upload.unlockHint")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      {...getRootProps()}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive || dragActive
                          ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
                          : "border-border hover:border-muted-foreground hover:bg-muted/20"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                          <UploadCloud className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-medium text-foreground">
                            {isDragActive ? t("upload.dropHere") : t("upload.dragDrop")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("upload.orClick")}
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                              JPG
                            </Badge>
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                              PNG
                            </Badge>
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                              WEBP
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              <Loader className="h-4 w-4 animate-spin text-primary" />
                              <span className="text-sm font-medium">{t("upload.processing")}</span>
                              <span className="text-sm text-muted-foreground ml-auto">
                                {uploadProgress}%
                              </span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                          </div>
                        </div>
                      )}
                    </div>

                    {file && (
                      <div className="p-4 bg-muted/50 rounded-xl border">
                        <div className="flex items-center gap-3">
                          {getFileIcon(fileType)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 shrink-0" />
                        </div>
                      </div>
                    )}

                    {work?.fileUrls && work.fileUrls.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {t("upload.previousFiles")}
                          </span>
                        </div>
                        <ScrollArea className="bg-muted/30 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            {work.fileUrls.map((fileUrl: string, index: number) => (
                              <UploadedFileController
                                key={index}
                                fileUrl={fileUrl}
                                setPreviewUrl={(v) => setPreviewUrl(v)}
                                setFileType={(v) => setFileType(v)}
                                workId={work._id}
                                refetch={refetch}
                              />
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                    )}

                    {previewUrl && fileType && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{t("upload.preview")}</span>
                        </div>
                        <div className="border-2 border-border rounded-xl bg-background overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-[300px] w-full object-contain"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full h-12 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      onClick={handleUploadImage}
                      disabled={!file || uploadImageMutation.isPending}
                    >
                      {uploadImageMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader className="h-5 w-5 animate-spin" />
                          {t("actions.uploadingFile")}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UploadCloud className="h-5 w-5" />
                          {t("actions.uploadFile")}
                        </div>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
