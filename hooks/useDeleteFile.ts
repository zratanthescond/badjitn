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

const useDeleteFile = (file: string, userId: string) => {
  return useMutation({ mutationFn: () => deleteFile(file, userId) });
};
export { useDeleteFile, deleteFile };
