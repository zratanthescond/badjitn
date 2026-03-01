"use client";

import * as React from "react";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { cn } from "@/lib/utils";

interface TiptapRendererProps {
  content: string;
  className?: string;
}

export const TiptapRenderer: React.FC<TiptapRendererProps> = ({
  content,
  className,
}) => {
  const [previewImage, setPreviewImage] = React.useState<{
    src: string;
    alt: string;
  } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        const img = target as HTMLImageElement;
        setPreviewImage({
          src: img.src,
          alt: img.alt || "Image preview",
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("click", handleImageClick);
    }

    return () => {
      if (container) {
        container.removeEventListener("click", handleImageClick);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none leading-relaxed [&_img]:cursor-zoom-in",
          className
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {previewImage && (
        <ImagePreviewDialog
          src={previewImage.src}
          alt={previewImage.alt}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
};
