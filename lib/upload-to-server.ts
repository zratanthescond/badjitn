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
  const internalUrl = process.env.FILE_SERVER_INTERNAL_URL;
  const publicUrl = process.env.NEXT_PUBLIC_FILE_SERVER_URL;
  
  const fileServerUrl = internalUrl || publicUrl || "https://fileserver.badgi.net";

  console.log("[uploadToFileServer] Environment variable inspection:", {
    FILE_SERVER_INTERNAL_URL: internalUrl || "undefined/empty",
    NEXT_PUBLIC_FILE_SERVER_URL: publicUrl || "undefined/empty",
    SelectedTargetURL: fileServerUrl
  });

  const webhookSecret = process.env.FILE_SERVER_SECRET || process.env.WEBHOOK_SECRET || "whsec_BMEOzFF0h1hx/pBvNAHoXJVhz/UIJkte";
  const maskedSecret = webhookSecret ? `${webhookSecret.slice(0, 8)}...[length: ${webhookSecret.length}]` : "none";
  console.log("[uploadToFileServer] Using Webhook Secret:", maskedSecret);

  console.log("[uploadToFileServer] Preparing binary payload. Filename:", filename, "Mime:", mimeType, "Buffer length:", fileBuffer.byteLength);
  const blob = new Blob([fileBuffer], { type: mimeType });
  console.log("[uploadToFileServer] Blob successfully constructed. Size:", blob.size, "Type:", blob.type);

  const formData = new FormData();
  formData.append("file", blob, filename);
  console.log("[uploadToFileServer] FormData object created and file field appended.");

  const url = `${fileServerUrl.replace(/\/$/, "")}/upload-image`;
  console.log("[uploadToFileServer] Final resolved request endpoint:", url);

  try {
    console.log("[uploadToFileServer] Dispatching axios.post request now (with 15s timeout)...");
    const startTime = Date.now();
    const response = await axios.post(url, formData, {
      headers: {
        "x-webhook-secret": webhookSecret,
      },
      timeout: 15000, 
    });

    const duration = Date.now() - startTime;
    console.log("[uploadToFileServer] Axios request completed in", duration, "ms. Status:", response.status);
    console.log("[uploadToFileServer] Response headers:", response.headers);
    console.log("[uploadToFileServer] Response payload data:", response.data);

    if (response.data && response.data.success && response.data.url) {
      console.log("[uploadToFileServer] Upload validation passed. Returning URL:", response.data.url);
      return response.data.url;
    } else {
      console.error("[uploadToFileServer] Validation failed. Success is false or url is missing in payload:", response.data);
      throw new Error(response.data?.error || "Invalid response format from file server");
    }
  } catch (error: any) {
    console.error("[uploadToFileServer] Caught axios exception during dispatch.");
    if (error.response) {
      console.error("[uploadToFileServer] Server responded with error status:", error.response.status);
      console.error("[uploadToFileServer] Server response headers:", error.response.headers);
      console.error("[uploadToFileServer] Server response payload:", error.response.data);
    } else if (error.request) {
      console.error("[uploadToFileServer] No response received from server. Request object:", {
        _headers: error.request._headers || "none",
        connection: error.request.connection ? "connected" : "not-connected"
      });
    } else {
      console.error("[uploadToFileServer] Error config setup failed:", error.message);
    }
    console.error("[uploadToFileServer] Full error stringified:", error.toString());
    throw new Error(error.response?.data?.error || error.message || "File server upload failed");
  }
}
