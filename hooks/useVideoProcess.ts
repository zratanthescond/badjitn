import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const video = await axios.post(
    "http://localhost:4000/process-video",
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

const useVideoProcess = (file: File) => {
  return useMutation({ mutationFn: () => uploadVideo(file) });
};
export { useVideoProcess, uploadVideo };
