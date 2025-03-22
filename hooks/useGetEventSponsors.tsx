import { getSponsorByIds } from "@/lib/actions/sponsor.action";
import { useQuery } from "@tanstack/react-query";

const useGetEventSponsors = (sponsorIds: string[]) => {
  return useQuery({
    queryKey: ["work", sponsorIds],
    queryFn: async () => {
      const sponsors = await getSponsorByIds({ sponsorIds });

      return sponsors;
    }, // Calls the server action
    //enabled: !!eventId && !!userId, // Prevents unnecessary queries
  });
};

export { useGetEventSponsors };
