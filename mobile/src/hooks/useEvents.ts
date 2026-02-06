import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";

export interface Event {
  _id: string;
  title: string;
  description?: string;
  country?: string;
  location?: string;
  startDateTime?: string;
  endDateTime?: string;
  imageUrl?: string;
}

export interface EventsResponse {
  data: Event[];
  totalPages: number;
}

export interface EventsFilters {
  page?: number;
  query?: string;
  category?: string;
  country?: string;
  date?: string;
}

export const useEvents = (filters: EventsFilters) => {
  const { page = 1, query = "", category = "", country = "", date = "" } = filters;

  return useQuery<EventsResponse>({
    queryKey: ["events", { page, query, category, country, date }],
    queryFn: () =>
      apiFetch<EventsResponse>("/api/events", {
        query: {
          page,
          query,
          category,
          country,
          date,
        },
      }),
  });
};

