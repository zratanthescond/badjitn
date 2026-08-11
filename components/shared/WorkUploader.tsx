"use client";

import { useState, useEffect, useCallback } from "react";
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
  PlusCircle,
  Clock3,
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

const defaultClientInfo: ClientInfo = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  republic: "",
  city: "",
  village: "",
  thematique: "",
  coAuthors: "",
  affiliation: "",
  correspondenceEmail: "",
};

function isClientInfoEmpty(info: ClientInfo) {
  return Object.values(info).every((v) => !String(v ?? "").trim());
}

type WorkRecord = {
  _id: string;
  title?: string;
  clientInfo?: ClientInfo;
  note?: string;
  summaryStatus?: "draft" | "submitted" | "approved";
  abstractFileUrls?: string[];
  fileUrls?: string[];
  createdAt?: string;
  submittedAt?: string;
  approvedAt?: string;
};

export default function WorkUploader({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  const t = useTranslations("WorkUploader");
  const tx = (key: string, fallback: string) => (t.has(key as any) ? t(key as any) : fallback);
  const locale = useLocale();
  const isRTL = locale === "ar";

  const { data, isLoading, refetch } = useGetWork(eventId, userId);
  const works: WorkRecord[] =
    data?.success && Array.isArray(data.works) ? data.works : [];

  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const selectedWork =
    works.find((item) => item._id === selectedWorkId) ?? null;
  const summaryStatus = selectedWork?.summaryStatus ?? "draft";
  const isApproved = summaryStatus === "approved";

  const [title, setTitle] = useState("");
  const [clientInfo, setClientInfo] = useState<ClientInfo>(
    defaultClientInfo
  );
  const [note, setNote] = useState<Content>("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [clientInfoTouched, setClientInfoTouched] = useState(false);

  // Abstract document upload (available immediately, not gated by approval)
  const [abstractFile, setAbstractFile] = useState<File | null>(null);
  const [abstractError, setAbstractError] = useState<string | null>(null);
  const [abstractDragActive, setAbstractDragActive] = useState(false);

  const submitSummaryMutation = useSubmitWorkSummary();
  const uploadImageMutation = useUploadWorkImage();
  const uploadAbstractMutation = useUploadWorkImage();

  useEffect(() => {
    if (!works.length) {
      setSelectedWorkId(null);
      return;
    }

    if (isCreatingNew) return;

    const selectedStillExists = works.some((item) => item._id === selectedWorkId);
    if (!selectedStillExists) {
      setSelectedWorkId(works[0]._id);
    }
  }, [works, selectedWorkId, isCreatingNew]);

  useEffect(() => {
    setTitle(selectedWork?.title || "");
    setClientInfo(selectedWork?.clientInfo || defaultClientInfo);
    setNote(selectedWork?.note || "");
    setClientInfoTouched(false);
    setFile(null);
    setPreviewUrl(null);
    setFileType(null);
    setUploadProgress(0);
    setError(null);
    setAbstractFile(null);
    setAbstractError(null);
  }, [selectedWorkId, selectedWork]);

  useEffect(() => {
    if (!userId) return;
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users?userId=${encodeURIComponent(userId)}`
    )
      .then((res) => res.json())
      .then((user: Record<string, string> | null) => {
        if (!user) return;
        setClientInfo((prev) => {
          if (selectedWorkId) return prev;
          if (clientInfoTouched) return prev;
          if (!isClientInfoEmpty(prev)) return prev;
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
  }, [userId, selectedWorkId, clientInfoTouched]);

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

  const onDropAbstract = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    setAbstractFile(selectedFile);
    setAbstractError(null);
  }, []);

  const { getRootProps: getAbstractRootProps, getInputProps: getAbstractInputProps, isDragActive: isAbstractDragActive } = useDropzone({
    onDrop: onDropAbstract,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    onDragEnter: () => setAbstractDragActive(true),
    onDragLeave: () => setAbstractDragActive(false),
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
        workId: selectedWork?._id,
        eventId,
        userId,
        title: title.trim() || tx("untitled", "Sans titre"),
        clientInfo,
        note: noteStr,
      },
      {
        onSuccess: (response: { work?: { _id?: string } }) => {
          setIsCreatingNew(false);
          if (response?.work?._id) {
            setSelectedWorkId(response.work._id);
          }
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
    if (!file || !selectedWork?._id) return;
    setError(null);
    uploadImageMutation.mutate(
      { workId: selectedWork._id, file, eventId, userId, kind: "poster" },
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

  const createNewSummary = () => {
    setIsCreatingNew(true);
    setSelectedWorkId(null);
    setTitle("");
    setClientInfo(defaultClientInfo);
    setNote("");
    setClientInfoTouched(false);
    setFile(null);
    setPreviewUrl(null);
    setFileType(null);
    setUploadProgress(0);
    setError(null);
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tx("summariesAvailable", "Resumes disponibles")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx("summariesAvailableHint", "Vous pouvez ajouter plusieurs resumes et modifier chacun a tout moment.")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={createNewSummary}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      {tx("newSummary", "Nouveau resume")}
                    </Button>
                  </div>

                  {works.length > 0 && (
                    <ScrollArea className="w-full rounded-xl border bg-muted/20">
                      <div className="flex gap-3 p-3">
                        {works.map((item) => {
                          const status = item.summaryStatus ?? "draft";
                          const isSelected = item._id === selectedWorkId;
                          const statusLabel =
                            status === "approved"
                              ? tx("statusApproved", "Approuve")
                              : status === "submitted"
                              ? tx("statusPending", "En attente")
                              : tx("statusDraft", "Brouillon");

                          return (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => {
                                setIsCreatingNew(false);
                                setSelectedWorkId(item._id);
                              }}
                              className={`min-w-[220px] rounded-xl border p-3 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-sm"
                                  : "border-border bg-background hover:border-primary/40"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate font-medium text-sm">
                                  {item.title?.trim() || tx("untitled", "Sans titre")}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className={
                                    status === "approved"
                                      ? "bg-green-500/10 text-green-700 border-green-200"
                                      : status === "submitted"
                                      ? "bg-blue-500/10 text-blue-700 border-blue-200"
                                      : "bg-yellow-500/10 text-yellow-700 border-yellow-200"
                                  }
                                >
                                  {statusLabel}
                                </Badge>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock3 className="h-3.5 w-3.5" />
                                {new Date(
                                  item.submittedAt || item.createdAt || Date.now()
                                ).toLocaleDateString(locale)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  )}
                </div>

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
                    <div className="space-y-1">
                      <Label className="text-xs">{tx("summary.fields.thematique", "Thématique")}</Label>
                      <Input
                        value={clientInfo.thematique ?? ""}
                        onChange={(e) =>
                          (setClientInfoTouched(true),
                          setClientInfo((prev) => ({ ...prev, thematique: e.target.value })))
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{tx("summary.fields.affiliation", "Établissement / affiliation")}</Label>
                      <Input
                        value={clientInfo.affiliation ?? ""}
                        onChange={(e) =>
                          (setClientInfoTouched(true),
                          setClientInfo((prev) => ({ ...prev, affiliation: e.target.value })))
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs">{tx("summary.fields.coAuthors", "Co-auteurs")}</Label>
                      <Input
                        value={clientInfo.coAuthors ?? ""}
                        onChange={(e) =>
                          (setClientInfoTouched(true),
                          setClientInfo((prev) => ({ ...prev, coAuthors: e.target.value })))
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs">{tx("summary.fields.correspondenceEmail", "Email de correspondance")}</Label>
                      <Input
                        type="email"
                        value={clientInfo.correspondenceEmail ?? ""}
                        onChange={(e) =>
                          (setClientInfoTouched(true),
                          setClientInfo((prev) => ({ ...prev, correspondenceEmail: e.target.value })))
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
                      editable
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

                <div className="space-y-2">
                  <Label>{tx("abstract.title", "Téléchargement de l'abstract")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {tx("abstract.description", "Formats acceptés : PDF, Word ou image. Disponible dès l'enregistrement du résumé.")}
                  </p>
                  {!selectedWork ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center rounded-xl bg-muted/30 border border-dashed">
                      <p className="text-sm text-muted-foreground">
                        {tx("abstract.saveFirst", "Enregistrez d'abord le résumé ci-dessus pour pouvoir joindre le fichier de l'abstract.")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        {...getAbstractRootProps()}
                        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 ${
                          isAbstractDragActive || abstractDragActive
                            ? "border-primary bg-primary/5 scale-[1.01] shadow-lg"
                            : "border-border hover:border-muted-foreground hover:bg-muted/20"
                        }`}
                      >
                        <input {...getAbstractInputProps()} />
                        <UploadCloud className="mx-auto h-6 w-6 text-primary mb-2" />
                        <p className="text-sm font-medium text-foreground">
                          {isAbstractDragActive
                            ? t("upload.dropHere")
                            : tx("abstract.dragDrop", "Glissez le fichier ici ou cliquez pour parcourir")}
                        </p>
                      </div>

                      {abstractFile && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border">
                          {getFileIcon(extractFileDetails(abstractFile.name).extension)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate text-sm">{abstractFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(abstractFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedWork.abstractFileUrls && selectedWork.abstractFileUrls.length > 0 && (
                        <ScrollArea className="bg-muted/30 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            {selectedWork.abstractFileUrls.map((fileUrl: string, index: number) => (
                              <a
                                key={index}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs shrink-0 hover:border-primary/40"
                              >
                                <File className="h-4 w-4 text-muted-foreground" />
                                {tx("abstract.fileLabel", "Fichier")} {index + 1}
                              </a>
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      )}

                      {abstractError && (
                        <p className="text-xs text-destructive">{abstractError}</p>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 rounded-xl"
                        disabled={!abstractFile || uploadAbstractMutation.isPending}
                        onClick={() => {
                          if (!abstractFile || !selectedWork?._id) return;
                          setAbstractError(null);
                          uploadAbstractMutation.mutate(
                            { workId: selectedWork._id, file: abstractFile, eventId, userId, kind: "abstract" },
                            {
                              onSuccess: () => {
                                setAbstractFile(null);
                                refetch();
                                toast({
                                  title: tx("abstract.uploadSuccess", "Fichier envoyé"),
                                  description: tx("abstract.uploadSuccessDescription", "Le fichier de l'abstract a bien été enregistré."),
                                });
                              },
                              onError: (err: Error) => setAbstractError(err.message),
                            }
                          );
                        }}
                      >
                        {uploadAbstractMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            {t("actions.uploadingFile")}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <UploadCloud className="h-4 w-4" />
                            {tx("abstract.upload", "Envoyer le fichier")}
                          </div>
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

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
                      {selectedWork ? tx("editSummary", "Modifier le resume") : t("actions.saveNotes")}
                    </div>
                  )}
                </Button>

                {summaryStatus === "submitted" && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    {t("messages.waitingApproval")}
                  </div>
                )}

                {summaryStatus === "approved" && selectedWork && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-sm">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    {tx("approvedResubmitNote", "Ce resume est approuve. Si vous le modifiez, il repassera en attente d'approbation.")}
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
                      {t("upload.title")} <span className="text-sm font-normal text-muted-foreground">({tx("abstract.finalPoster", "e-poster final")})</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t("upload.description")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {!selectedWork ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-muted/30 border border-dashed">
                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">
                      {tx("selectSummaryFirst", "Creez ou selectionnez d'abord un resume.")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tx("selectSummaryFirstHint", "L'image de soumission sera rattachee au resume choisi.")}
                    </p>
                  </div>
                ) : !isApproved ? (
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

                    {selectedWork?.fileUrls && selectedWork.fileUrls.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {t("upload.previousFiles")}
                          </span>
                        </div>
                        <ScrollArea className="bg-muted/30 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            {selectedWork.fileUrls.map((fileUrl: string, index: number) => (
                              <UploadedFileController
                                key={index}
                                fileUrl={fileUrl}
                                setPreviewUrl={(v) => setPreviewUrl(v)}
                                setFileType={(v) => setFileType(v)}
                                workId={selectedWork._id}
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
                            alt={tx("preview", "Preview")}
                            className="max-h-[300px] w-full object-contain"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full h-12 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      onClick={handleUploadImage}
                      disabled={!file || !selectedWork?._id || uploadImageMutation.isPending}
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
