import { useQuery } from "@tanstack/react-query";
import { fetchFields } from "@/lib/actions/field.action";

const useGetFields = (userId: string) => {
  return useQuery({
    queryKey: ["fields", userId],
    queryFn: async () => {
      const sponsors = await fetchFields(userId);
      const formattedFields = sponsors.data.map((field: any) => ({
        id: field._id,
        name: field.label,
        type: field.type,
        options: field.options || [],
      }));
      return formattedFields;
    }, // Calls the server action
    //enabled: !!eventId && !!userId, // Prevents unnecessary queries
  });
};

export { useGetFields };
