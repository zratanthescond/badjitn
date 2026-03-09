import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export type ClientInfo = {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  republic?: string;
  city?: string;
  village?: string;
};

export type SubmitSummaryParams = {
  userId: string;
  eventId: string;
  title: string;
  clientInfo: ClientInfo;
  note: string;
};

export type UploadImageParams = {
  file: File;
  userId: string;
  eventId: string;
};

const submitSummary = async (data: SubmitSummaryParams) => {
  const formData = new FormData();
  formData.append("userId", data.userId);
  formData.append("eventId", data.eventId);
  formData.append("title", data.title);
  formData.append("clientInfo", JSON.stringify(data.clientInfo));
  formData.append("note", typeof data.note === "string" ? data.note : "");
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploadwork`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" }, responseType: "json" }
  );
  if (res.data?.success === false) throw new Error(res.data?.error || "Submit failed");
  return res.data;
};

const uploadSubmissionImage = async (data: UploadImageParams) => {
  const formData = new FormData();
  formData.append("userId", data.userId);
  formData.append("eventId", data.eventId);
  formData.append("file", data.file);
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploadwork`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" }, responseType: "json" }
  );
  if (res.data?.success === false) throw new Error(res.data?.error || "Upload failed");
  return res.data;
};

export function useSubmitWorkSummary() {
  return useMutation({ mutationFn: submitSummary });
}

export function useUploadWorkImage() {
  return useMutation({ mutationFn: uploadSubmissionImage });
}
