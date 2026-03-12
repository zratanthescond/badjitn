import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
const deleteFile = async (fileUrl: string, workId: string) => {
  const video = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploadwork/deleteFile`,
    { fileUrl, workId }
  );
  // console.log(video);
  // const blob = await video.blob();
  return video.data;
};

interface UseDeleteFileProps {
  workId: string;
  fileUrl: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const useDeleteFile = ({ workId, fileUrl, onSuccess, onError }: UseDeleteFileProps) => {
  return useMutation({
    mutationFn: () => deleteFile(fileUrl, workId),
    onSuccess,
    onError,
  });
};
export { useDeleteFile, deleteFile };
