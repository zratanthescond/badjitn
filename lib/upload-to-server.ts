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
    
    // Use native fetch instead of axios to avoid boundary/FormData issues in Node.js.
    // IMPORTANT: Do NOT set "Content-Type" header manually. 
    // Allowing fetch to set it automatically ensures the boundary boundary parameter is included.
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-webhook-secret": webhookSecret,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`File server returned ${response.status}: ${errorText}`);
    }

    const resData = await response.json();
    if (resData && resData.success && resData.url) {
      return resData.url;
    } else {
      throw new Error(resData?.error || "Invalid response from file server");
    }
  } catch (error: any) {
    console.error("Error uploading file to file server:", error.message || error);
    throw new Error(error.message || "File server upload failed");
  }
}
