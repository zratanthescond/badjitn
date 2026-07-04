import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
const uploadVideo = async (data: FormData) => {
  const video = await axios.post(
    `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}createReel`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-webhook-secret": process.env.NEXT_PUBLIC_FILE_SERVER_SECRET || "whsec_BMEOzFF0h1hx/pBvNAHoXJVhz/UIJkte",
      },
      responseType: "json",
    }
  );
  // console.log(video);
  // const blob = await video.blob();
  return video.data;
};

const useReelCreate = () => {
  return useMutation({ mutationFn: (data: FormData) => uploadVideo(data) });
};
export { useReelCreate, uploadVideo };
