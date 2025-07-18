"use client";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  File,
  FileText,
  Eye,
  Trash2,
  Download,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { extractFileDetails } from "@/lib/utils";
import { useDeleteFile } from "@/hooks/useDeleteFile";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface UploadedFileControllerProps {
  fileUrl: string;
  setPreviewUrl: (url: string) => void;
  setFileType: (type: string) => void;
  workId: string;
  refetch: () => void;
}

export default function UploadedFileController({
  fileUrl,
  setPreviewUrl,
  setFileType,
  workId,
  refetch,
}: UploadedFileControllerProps) {
  const t = useTranslations("UploadedFileController");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Extract file details from URL
  const fileName = fileUrl.split("/").pop() || "unknown-file";
  const { name, extension } = extractFileDetails(fileName);

  const { mutate: deleteFile } = useDeleteFile({
    workId,
    fileUrl,
    onSuccess: () => {
      refetch();
      setIsDeleting(false);
      toast({
        title: t("messages.deleteSuccess"),
        description: t("messages.deleteSuccessDescription"),
      });
    },
    onError: () => {
      setIsDeleting(false);
      toast({
        title: t("messages.deleteError"),
        description: t("messages.deleteErrorDescription"),
        variant: "destructive",
      });
    },
  });

  const handlePreview = () => {
    setPreviewUrl(fileUrl);

    setFileType(extension);
    toast({
      title: t("messages.previewLoaded"),
      description: t("messages.previewLoadedDescription", { fileName: name }),
    });
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: t("messages.downloadStarted"),
      description: t("messages.downloadStartedDescription", { fileName: name }),
    });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteFile();
    setShowDeleteDialog(false);
  };

  const getFileIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case "pdf":
        return <File className="h-5 w-5 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeColor = (ext: string) => {
    switch (ext.toLowerCase()) {
      case "pdf":
        return "bg-red-100 text-red-700 border-red-200";
      case "doc":
      case "docx":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <TooltipProvider>
      <Card
        className="group relative p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-xl min-w-[280px] max-w-[320px]"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

        {/* File Header */}
        <div className="relative flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
              {getFileIcon(extension)}
            </div>
            <div className="flex-1 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-semibold text-gray-800 truncate text-sm group-hover:text-blue-700 transition-colors">
                    {name}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
              <Badge
                variant="secondary"
                className={`text-xs font-medium ${getFileTypeColor(
                  extension
                )} mt-1`}
              >
                {extension.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center">
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="flex-1 h-9 bg-white/80 hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
                disabled={isDeleting}
              >
                <Eye className="h-4 w-4 mr-1" />
                {t("actions.preview")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("tooltips.preview")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-9 px-3 bg-white/80 hover:bg-green-50 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 transition-all duration-200"
                disabled={isDeleting}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("tooltips.download")}</p>
            </TooltipContent>
          </Tooltip>

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 bg-white/80 hover:bg-red-50 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800 transition-all duration-200"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("tooltips.delete")}</p>
              </TooltipContent>
            </Tooltip>

            <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-2">
              <AlertDialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                      {t("deleteDialog.title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 mt-1">
                      {t("deleteDialog.description", { fileName: name })}
                    </AlertDialogDescription>
                  </div>
                </div>
              </AlertDialogHeader>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t("deleteDialog.warning")}
                </p>
              </div>

              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300">
                  {t("deleteDialog.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {t("deleteDialog.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* External link indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ExternalLink className="h-3 w-3 text-gray-400" />
        </div>
      </Card>
    </TooltipProvider>
  );
}
