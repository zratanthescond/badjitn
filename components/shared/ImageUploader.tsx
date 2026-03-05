"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { generateClientDropzoneAccept } from "uploadthing/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { convertFileToUrl } from "@/lib/utils";

type ImageUploaderProps = {
    value: string;
    onChange: (url: string) => void;
    aspectRatio?: "square" | "wide";
    label?: string;
    placeholder?: string;
};

export function ImageUploader({
    value,
    onChange,
    aspectRatio = "square",
    label,
    placeholder = "Drag & drop an image, or click to select",
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string>(value || "");

    const { startUpload } = useUploadThing("imageUploader");

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            const file = acceptedFiles[0];
            const localPreview = convertFileToUrl(file);
            setPreview(localPreview);
            setIsUploading(true);

            try {
                const uploadedImages = await startUpload([file]);
                if (uploadedImages && uploadedImages.length > 0) {
                    const uploadedUrl = uploadedImages[0].url;
                    onChange(uploadedUrl);
                    setPreview(uploadedUrl);
                }
            } catch (error) {
                console.error("Upload failed:", error);
                setPreview(value || "");
            } finally {
                setIsUploading(false);
            }
        },
        [startUpload, onChange, value]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: generateClientDropzoneAccept(["image/*"]),
        maxFiles: 1,
        multiple: false,
    });

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview("");
        onChange("");
    };

    const containerClasses =
        aspectRatio === "wide"
            ? "w-full aspect-[3/1] min-h-[140px]"
            : "w-40 h-40";

    const imageClasses =
        aspectRatio === "wide" ? "object-cover" : "object-cover";

    const hasImage = preview && preview.length > 0;

    return (
        <div className="space-y-2">
            {label && (
                <p className="text-sm font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-indigo-500" />
                    {label}
                </p>
            )}
            <div
                {...getRootProps()}
                className={`
          relative group cursor-pointer overflow-hidden transition-all duration-300
          ${containerClasses}
          ${hasImage
                        ? "rounded-2xl border-2 border-transparent hover:border-indigo-400/50"
                        : `rounded-2xl border-2 border-dashed transition-colors duration-200
                 ${isDragActive
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-muted-foreground/30 hover:border-indigo-400/60 bg-muted/30 hover:bg-muted/50"
                        }`
                    }
        `}
            >
                <input {...getInputProps()} />

                {hasImage ? (
                    <>
                        <Image
                            src={preview}
                            alt="Uploaded"
                            fill
                            className={`${imageClasses} transition-transform duration-300 group-hover:scale-105`}
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                                <Upload className="h-6 w-6 text-white" />
                                <span className="text-white text-xs font-medium">
                                    Change Image
                                </span>
                            </div>
                        </div>
                        {/* Remove button */}
                        <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        {/* Upload spinner overlay */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                                    <span className="text-white text-sm font-medium">
                                        Uploading...
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
                        {isUploading ? (
                            <>
                                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                                <span className="text-sm text-muted-foreground font-medium">
                                    Uploading...
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-colors duration-200">
                                    <Upload className="h-5 w-5 text-indigo-500" />
                                </div>
                                <p className="text-xs text-muted-foreground text-center leading-tight">
                                    {placeholder}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60">
                                    PNG, JPG, SVG up to 4MB
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
