import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
type uploadWorkParams = {
  file?: File;
  note?: string;
  userId: string;
  eventId: string;
};
const uploadWork = async (data: uploadWorkParams) => {
  const formData = new FormData();
  if (data.file) {
    formData.append("file", data.file);
  }
  if (data.note) {
    formData.append("note", data.note);
  }
  if (data.userId) {
    formData.append("userId", data.userId);
  }
  if (data.eventId) {
    formData.append("eventId", data.eventId);
  }
  const work = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploadwork`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "json",
    }
  );

  return work.data;
};

const useUploadWork = (data: uploadWorkParams) => {
  return useMutation({ mutationFn: () => uploadWork(data) });
};
export { useUploadWork, uploadWork };
