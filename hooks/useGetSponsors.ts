import { useQuery } from "@tanstack/react-query";

import { getSponsors } from "@/lib/actions/sponsor.action";

const useGetSponsors = (eventId: string | null, userId: string | null) => {
  return useQuery({
    queryKey: ["work", eventId, userId],
    queryFn: async () => {
      const sponsors = await getSponsors(eventId, userId);
      const formattedSponsors = sponsors.data.map((sponsor: any) => ({
        id: sponsor._id,
        name: sponsor.name,
      }));
      return formattedSponsors;
    }, // Calls the server action
    //enabled: !!eventId && !!userId, // Prevents unnecessary queries
  });
};

export { useGetSponsors };
