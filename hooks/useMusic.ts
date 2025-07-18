import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

// Keep the original getMusic function signature for backward compatibility
const getMusic = async (limit: number, searchQuery?: string) => {
  const music = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/music?limit=${limit}&searchQuery=${searchQuery}`
  );
  return music.data;
};

// New function for infinite scroll with page parameter
const getMusicWithPagination = async (
  page: number,
  limit: number,
  searchQuery?: string
) => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (searchQuery) {
    params.append("searchQuery", searchQuery);
  }

  const music = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/music?${params.toString()}`
  );
  return music.data;
};

const useMusic = (limit: number, searchQuery?: string) => {
  return useInfiniteQuery({
    queryKey: ["music", limit, searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      getMusicWithPagination(pageParam, limit, searchQuery),
    getNextPageParam: (lastPage, allPages) => {
      // Adjust this condition based on your API response structure
      // Option 1: If your API returns hasNextPage
      if (lastPage?.hasNextPage) {
        return allPages.length + 1;
      }

      // Option 2: If your API returns data array and you check length
      if (
        lastPage?.data &&
        Array.isArray(lastPage.data) &&
        lastPage.data.length === limit
      ) {
        return allPages.length + 1;
      }

      // Option 3: If your API response is directly an array
      if (Array.isArray(lastPage) && lastPage.length === limit) {
        return allPages.length + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export { useMusic, getMusic };
