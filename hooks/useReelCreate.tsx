import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
const uploadVideo = async (data: FormData) => {
  const video = await axios.post("http://localhost:4000/createReel", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "json",
  });
  // console.log(video);
  // const blob = await video.blob();
  return video.data;
};

const useReelCreate = (data: FormData) => {
  return useMutation({ mutationFn: () => uploadVideo(data) });
};
export { useReelCreate, uploadVideo };
