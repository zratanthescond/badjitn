"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ImagePreviewDialogProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  src,
  alt,
  isOpen,
  onClose,
}) => {
  const t = useTranslations("event");

  const handleDownload = async (format: "png" | "jpg" | "webp") => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        const mimeType = `image/${format === "jpg" ? "jpeg" : format}`;
        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        const link = document.createElement("a");
        link.download = `${alt || "image"}.${format}`;
        link.href = dataUrl;
        link.click();

        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <Download className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownload("png")}>
                Download PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("jpg")}>
                Download JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("webp")}>
                Download WEBP
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="w-full h-full flex items-center justify-center p-4">
          <Zoom>
            <img
              src={src}
              alt={alt || ""}
              className="max-w-full max-h-[85vh] object-contain rounded-md"
            />
          </Zoom>
        </div>
      </DialogContent>
    </Dialog>
  );
};
