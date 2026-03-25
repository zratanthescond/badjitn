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
  workId?: string;
  userId: string;
  eventId: string;
  title: string;
  clientInfo: ClientInfo;
  note: string;
};

export type UploadImageParams = {
  workId: string;
  file: File;
  userId: string;
  eventId: string;
};

const submitSummary = async (data: SubmitSummaryParams) => {
  const formData = new FormData();
  if (data.workId) formData.append("workId", data.workId);
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
  // Step 1: Upload to the new native upload API
  const uploadFormData = new FormData();
  uploadFormData.append("file", data.file);
  
  const uploadRes = await axios.post("/api/upload", uploadFormData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!uploadRes.data?.success || !uploadRes.data?.url) {
    throw new Error(uploadRes.data?.message || "Initial file upload failed");
  }

  const fileUrl = uploadRes.data.url;

  // Step 2: Submit the URL to the work submission API
  const workFormData = new FormData();
  workFormData.append("workId", data.workId);
  workFormData.append("userId", data.userId);
  workFormData.append("eventId", data.eventId);
  workFormData.append("fileUrl", fileUrl); // Send URL instead of binary file

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploadwork`,
    workFormData,
    { headers: { "Content-Type": "multipart/form-data" }, responseType: "json" }
  );
  
  if (res.data?.success === false) throw new Error(res.data?.error || "Metadata update failed");
  return res.data;
};

export function useSubmitWorkSummary() {
  return useMutation({ mutationFn: submitSummary });
}

export function useUploadWorkImage() {
  return useMutation({ mutationFn: uploadSubmissionImage });
}
