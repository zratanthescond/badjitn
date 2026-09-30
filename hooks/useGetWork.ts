import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

const getWork = async (eventId: string, userId?: string, email?: string) => {
  const params = new URLSearchParams({ eventId });
  if (userId) params.set("userId", userId);
  if (email) params.set("email", email);
  const work = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploadwork?${params.toString()}`
  );
  return work.data;
};

const useGetWork = (eventId: string, userId?: string, email?: string) => {
  return useQuery({
    queryKey: ["work", eventId, userId || email],
    queryFn: () => getWork(eventId, userId, email),
    enabled: !!(userId || email),
  });
};
export { useGetWork, getWork };
