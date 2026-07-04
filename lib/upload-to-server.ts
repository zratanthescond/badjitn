import axios from "axios";

/**
 * Uploads a file buffer directly to the media/HLS server's /upload-image endpoint.
 * This runs entirely on the server-side, keeping the WEBHOOK_SECRET secure.
 * 
 * @param fileBuffer Binary buffer of the file.
 * @param filename File name (including extension).
 * @param mimeType MIME type of the file.
 * @returns The relative asset URL hosted on the file server (e.g. "/public/images/...").
 */
export async function uploadToFileServer(
  fileBuffer: Buffer | Uint8Array,
  filename: string,
  mimeType: string
): Promise<string> {
  const fileServerUrl = process.env.NEXT_PUBLIC_FILE_SERVER_URL || "http://localhost:4000";
  const webhookSecret = process.env.WEBHOOK_SECRET || "whsec_BMEOzFF0h1hx/pBvNAHoXJVhz/UIJkte";

  // Convert buffer to a standard Blob so FormData wraps it correctly
  const blob = new Blob([fileBuffer], { type: mimeType });

  const formData = new FormData();
  formData.append("file", blob, filename);

  try {
    const url = `${fileServerUrl.replace(/\/$/, "")}/upload-image`;
    
    // Use axios to bypass Node's native fetch (undici) FormData serialization bugs in server runtimes.
    // IMPORTANT: Do NOT set "Content-Type" header manually. 
    // Allowing axios to set it automatically ensures the boundary parameter is generated and appended.
    const response = await axios.post(url, formData, {
      headers: {
        "x-webhook-secret": webhookSecret,
      },
    });

    if (response.data && response.data.success && response.data.url) {
      return response.data.url;
    } else {
      throw new Error(response.data?.error || "Invalid response from file server");
    }
  } catch (error: any) {
    console.error("Error uploading file to file server:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message || "File server upload failed");
  }
}
