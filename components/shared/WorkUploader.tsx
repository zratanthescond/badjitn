"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import FileViewer from "react-file-viewer";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { MinimalTiptapEditor } from "../minimal-tiptap";
import { Skeleton } from "../ui/skeleton";
import type { Content } from "@tiptap/react";
import { useUploadWork } from "@/hooks/useUploadWork";
import { toast } from "@/hooks/use-toast";
import { useGetWork } from "@/hooks/useGetWork";
import UploadedFileController from "./UploadedFileController";
import { extractFileDetails } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

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
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState<Content>(data?.works.note);
  const [fileType, setFileType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    // Simulate upload progress
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
    const { name, extension } = extractFileDetails(selectedFile.name);
    setFileType(extension);
    setError(null);

    setTimeout(() => setUploadProgress(0), 2000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const { isPending, mutate, isSuccess } = useUploadWork({
    file,
    note,
    userId: userId,
    eventId: eventId,
  });

  useEffect(() => {
    if (isSuccess) {
      setFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      refetch();
      toast({
        title: t("messages.uploadSuccess"),
        description: t("messages.uploadSuccessDescription"),
      });
    }
  }, [isSuccess, refetch, t]);

  useEffect(() => {
    if (data && data.success) {
      if (note == null) {
        setNote(data.works.note);
      }
    }
  }, [data, isLoading, note]);

  const getFileIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "pdf":
        return <File className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case "doc":
      case "docx":
        return (
          <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        );
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t("description")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Text Editor Panel */}
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden group hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <CardHeader className="relative bg-gradient-to-r from-muted/50 to-muted/30 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20">
                  <Edit3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {t("notes.title")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("notes.description")}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <ScrollArea className="border-2 border-border rounded-xl focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200">
                  <MinimalTiptapEditor
                    placeholder={t("notes.placeholder")}
                    className="min-h-[400px] bg-background"
                    value={note}
                    onChange={setNote}
                    editorContentClassName="p-6"
                    output="html"
                    autofocus={true}
                    editable={true}
                    editorClassName="focus:outline-none"
                    content={note}
                    editorProps={{
                      attributes: {
                        spellcheck: "true",
                        class:
                          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none dark:prose-invert",
                      },
                    }}
                  />
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>

              <Button
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none"
                disabled={
                  isPending || !note || note.toString().trim().length === 0
                }
                onClick={() => mutate()}
              >
                {isPending ? (
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
            </CardContent>
          </Card>

          {/* File Upload Panel */}
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden group hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
              {/* Drag & Drop Zone */}
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive || dragActive
                    ? "border-primary bg-primary/5 scale-105 shadow-lg"
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
                      {isDragActive
                        ? t("upload.dropHere")
                        : t("upload.dragDrop")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("upload.orClick")}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <Badge
                        variant="secondary"
                        className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                      >
                        PDF
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      >
                        DOC
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      >
                        DOCX
                      </Badge>
                    </div>
                  </div>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Loader className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {t("upload.processing")}
                        </span>
                        <span className="text-sm text-muted-foreground ml-auto">
                          {uploadProgress}%
                        </span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Current File Display */}
              {file && (
                <div className="p-4 bg-muted/50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    {getFileIcon(fileType)}
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                  </div>
                </div>
              )}

              {/* Previously Uploaded Files */}
              {data?.works?.fileUrls && data.works.fileUrls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {t("upload.previousFiles")}
                    </span>
                  </div>
                  <ScrollArea className="bg-muted/30 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      {data.works.fileUrls.map(
                        (fileUrl: string, index: number) => (
                          <UploadedFileController
                            key={index}
                            fileUrl={fileUrl}
                            setPreviewUrl={(value) => setPreviewUrl(value)}
                            setFileType={(value) => setFileType(value)}
                            workId={data.works._id}
                            refetch={refetch}
                          />
                        )
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              )}

              {/* File Preview */}
              {previewUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {t("upload.preview")}
                    </span>
                  </div>
                  <ScrollArea className="border-2 border-border rounded-xl bg-background">
                    <div className="p-4">
                      <FileViewer
                        key={previewUrl}
                        fileType={fileType}
                        filePath={previewUrl}
                        className="max-h-[400px]"
                      />
                    </div>
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </div>
              ) : (
                <Skeleton className="w-full h-[300px] bg-muted rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <File className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      {t("upload.noPreview")}
                    </p>
                  </div>
                </Skeleton>
              )}

              <Button
                className="w-full h-12 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:opacity-50"
                onClick={() => mutate()}
                disabled={!file || isPending}
              >
                {isPending ? (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
