import { useState, useEffect, use, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader, UploadCloud, UploadCloudIcon } from "lucide-react";
import FileViewer from "react-file-viewer";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { MinimalTiptapEditor } from "../minimal-tiptap";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { Content, extensions, useEditor } from "@tiptap/react";
import { useUploadWork } from "@/hooks/useUploadWork";
import { is } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { useGetWork } from "@/hooks/useGetWork";
import UploadedFileController from "./UploadedFileController";
import { extractFileDetails } from "@/lib/utils";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useDropzone } from "react-dropzone";

export default function WorkUploader({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  const { data, isLoading, refetch } = useGetWork(eventId, userId);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState<Content>(data?.works.note);
  const [fileType, setFileType] = useState<string | null>(null);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setPreviewUrl(URL.createObjectURL(acceptedFiles[0]));
    const { name, extension } = extractFileDetails(acceptedFiles[0].name);

    setFileType(extension);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF and Word files are allowed.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
    const { name, extension } = extractFileDetails(selectedFile.name);

    setFileType(extension);

    // Create a Blob URL
    const blobUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(blobUrl);
  };
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
      refetch();
      toast({
        title: "Success",
        description: "Work uploaded successfully.",
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (data && data.success) {
      console.log(data.works.note);
      if (note == null) {
        setNote(data.works.note);
      }
    }
  }, [data, isLoading, note]);
  return (
    <div className="flex flex-col wrapper   md:flex-row lg:flex-row min-w-full h-full items-center justify-center gap-2">
      <Card className=" bg-transparent flex mx-auto text-center max-h-full w-full h-full  md:min-h-full">
        <CardContent className="max-h-[90vh] flex flex-col glass gap-2 rounded-lg p-2 w-full ">
          <CardHeader className="h-2 text-sm">
            Optional add a note or write your file
          </CardHeader>
          <Separator />
          <ScrollArea className="border-1 rounded-lg">
            <MinimalTiptapEditor
              placeholder="Write something..."
              className="min-h-[400px] dark:bg-slate-900 bg-white"
              value={note}
              onChange={setNote}
              editorContentClassName="p-5"
              output="html"
              autofocus={true}
              editable={true}
              editorClassName="focus:outline-none"
              content={note}
              editorProps={{
                attributes: {
                  spellcheck: "true",
                  class:
                    "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
                },
              }}
            />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
          <Separator />
          <Button
            className="mt-4  glass"
            disabled={isPending || note?.length === 0}
            onClick={() => mutate()}
          >
            {isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </CardContent>
      </Card>
      <Card className=" bg-transparent flex  text-center max-h-full md:w-1/2   h-full w-full ">
        <CardContent className="max-h-[90vh] flex flex-col glass gap-2 rounded-lg p-2 w-full  ">
          {" "}
          <CardHeader className="h-2 text-sm">
            Upload a Word or a PDF file
          </CardHeader>
          <Separator />
          <div
            {...getRootProps()}
            className="bg-card border-dashed h-14 cursor-pointer border-2 items-center justify-center rounded-full text-center  border-white w-full"
          >
            <input
              {...getInputProps()}
              type="file"
              className="cursor-pointer "
            />
            <div className="flex items-center self-center justify-center gap-2">
              <p className="text-sm"> Select a file to upload pdf or word </p>
              <UploadCloudIcon className="self-center" size={20} />
            </div>
          </div>
          <Separator />
          {data?.works?.fileUrls && (
            <div className="flex w-full">
              {data.works.fileUrls.length === 0 && <p>Uploaded files:</p>}
              <ScrollArea className="bg-card rounded-full w-full overflow-x-auto">
                <div className="flex items-center justify-start gap-2 h-14 min-w-max">
                  {data.works.fileUrls.map((fileUrl: string, index: number) => (
                    <UploadedFileController
                      key={index}
                      fileUrl={fileUrl}
                      setPreviewUrl={(value) => setPreviewUrl(value)}
                      setFileType={(value) => setFileType(value)}
                      workId={data.works._id}
                      refetch={refetch}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
          <Separator />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {previewUrl ? (
            <ScrollArea className="border-1 rounded-lg w-full">
              <FileViewer
                // fileType={file?.name.split(".").pop() || ""}
                fileType={fileType}
                filePath={previewUrl}
                className="max-h-full flex"
              />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          ) : (
            <Skeleton className="w-full h-[400px] bg-slate-200 items-center rounded-lg justify-center">
              <p className="text-sm mt-2">No file uploaded yet.</p>
            </Skeleton>
          )}
          <Separator />
          <Button
            className="mt-4 flex items-center gap-2 glass"
            onClick={() => mutate()}
            disabled={!file || isPending}
          >
            {isPending ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <>
                <UploadCloud size={18} /> Upload
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
