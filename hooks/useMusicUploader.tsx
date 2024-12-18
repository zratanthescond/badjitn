import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
const uploadMusic = async (file: File, userId: string) => {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("userId", userId);
  const video = await axios.post(
    `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "json",
    }
  );
  // console.log(video);
  // const blob = await video.blob();
  return video.data;
};

const useUploadMusic = (file: File, userId: string) => {
  return useMutation({ mutationFn: () => uploadMusic(file, userId) });
};
export { useUploadMusic, uploadMusic };
