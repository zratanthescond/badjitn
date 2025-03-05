import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const sendReport = async (eventId: string, userId: string, cause: string) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reportEvent`,
    { eventId, userId, cause },
    {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "json",
    }
  );
  return response.data;
};

const useReport = (eventId: string, userId: string, cause: string) => {
  return useMutation({ mutationFn: () => sendReport(eventId, userId, cause) });
};

export { useReport, sendReport };
