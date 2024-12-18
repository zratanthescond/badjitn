import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
const getMusic = async (limit: number) => {
  const music = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/music?limit=${limit}`
  );
  // console.log(video);
  // const blob = await video.blob();
  return music.data;
};

const useMusic = (limit: number) => {
  return useQuery({ queryKey: ["music"], queryFn: () => getMusic(limit) });
};
export { useMusic, getMusic };
