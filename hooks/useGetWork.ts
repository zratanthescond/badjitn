import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
const getWork = async (eventId: string, userId: string) => {
  const work = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploadwork?eventId=${eventId}&userId=${userId}`
  );
  // console.log(video);
  // const blob = await video.blob();
  return work.data;
};

const useGetWork = (eventId: string, userId: string) => {
  return useQuery({
    queryKey: ["work", eventId, userId],
    queryFn: () => getWork(eventId, userId),
  });
};
export { useGetWork, getWork };
