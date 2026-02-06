import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";

export interface CreateEventInput {
  title: string;
  description?: string;
  locationName?: string;
  country?: string;
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      return apiFetch("/api/mobile/events", "POST", {
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      // Refresh events list
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

