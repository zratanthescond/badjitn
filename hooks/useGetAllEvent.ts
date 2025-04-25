import { GetAllEventsParams } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
const getAllEvents = async ({
  page,
  limit,
  country,
  category,
  query,
  date,
}: GetAllEventsParams) => {
  const work = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/events?page=${page}&limit=${limit}&country=${country}&category=${category}&query=${query}&date=${date}`
  );

  return work.data;
};

const useGetAllEvents = ({
  page,
  limit,
  country,
  category,
  query,
  date,
}: GetAllEventsParams) => {
  return useQuery({
    queryKey: ["events", page, limit, country, category, query, date],
    queryFn: () =>
      getAllEvents({ page, limit, country, category, query, date }),
  });
};
export { useGetAllEvents, getAllEvents };
