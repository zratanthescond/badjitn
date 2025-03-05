import { extractFileDetails } from "@/lib/utils";
import { Button } from "../ui/button";
import { Delete, EyeIcon, FileDown, Trash } from "lucide-react";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { set } from "mongoose";
import { useDeleteFile } from "@/hooks/useDeleteFile";
import { use, useEffect } from "react";
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
} from "../ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

export default function UploadedFileController({
  fileUrl,
  setPreviewUrl,
  setFileType,
  workId,
  refetch,
}: {
  fileUrl: string;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string>>;
  setFileType: React.Dispatch<React.SetStateAction<string>>;
  workId: string;
  refetch: () => void;
}) {
  const { name, extension } = extractFileDetails(fileUrl);
  const newFilePreviewUrl = process.env.NEXT_PUBLIC_SERVER_URL + fileUrl;
  const { isPending, isSuccess, mutate } = useDeleteFile(fileUrl, workId);
  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast({
        title: "Success",
        description: "File deleted successfully.",
      });
    }
  }, [isSuccess]);
  return (
    <div className="p-2 h-10 flex w-full flex-row items-center justify-between glass rounded-lg">
      <div className="flex items-center gap-2 justify-start">
        {extension === "docx" || extension === "doc" ? (
          <FaFileWord />
        ) : (
          <FaFilePdf />
        )}
        {name}.{extension}
      </div>

      <div className="flex items-start justify-end">
        <Button
          variant={"ghost"}
          size={"icon"}
          className="ml-2"
          onClick={() => {
            setPreviewUrl(newFilePreviewUrl);
            setFileType(extension);
          }}
        >
          <EyeIcon />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={"ghost"}
              size={"icon"}
              className="ml-2"

              //  disabled={isPending}
            >
              <Trash />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this file
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  mutate();
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant={"ghost"} size={"icon"} className="ml-2" asChild>
          <a href={newFilePreviewUrl} target="_blank" rel="noopener noreferrer">
            <FileDown />
          </a>
        </Button>
      </div>
    </div>
  );
}
