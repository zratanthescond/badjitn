import { getEventDates } from "@/lib/actions/event.actions";
import { useQuery } from "@tanstack/react-query";

export const useGetEventDates = () => {
  return useQuery({
    queryKey: ["eventDates"],
    queryFn: async () => {
      const data = await getEventDates();
      return data as { date: string; count: number }[];
    },
  });
};
