import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";
import qs from "query-string";

import { UrlQueryParams, RemoveUrlQueryParams } from "@/types";
import generatePDF, { Resolution, Margin } from "react-to-pdf";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );
  const homeEvents: string = new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
  });

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
    homeEvents: homeEvents,
  };
};

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const formatPrice = (price: string, currency: string | null) => {
  const amount = parseFloat(price);
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);

  return formattedPrice;
};

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function removeKeysFromQuery({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};
export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.ceil(seconds % 60);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
export function getLastTwoWords(str: string) {
  // Split the string into an array of words
  const words = str.trim().split(","); // Split by spaces, handling multiple spaces
  // Get the last two words
  return words.slice(-2).join(" ").replace(/\d+/g, "").trim(); // Join them back into a string
}

const extractFileDetails = (filePath: string) => {
  const fileName = filePath.split(/[/\\]/).pop(); // Extract file name
  if (!fileName) return { name: "", extension: "", uuid: "" };
  const lastDotIndex = fileName.lastIndexOf("."); // Find the last dot

  if (lastDotIndex === -1) {
    return { name: fileName, extension: "", uuid: "" }; // No extension case
  }

  let name = fileName.substring(0, lastDotIndex);
  const extension = fileName.substring(lastDotIndex + 1);

  // Regular expression to match UUID
  const uuidMatch = name.match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  );
  const uuid = uuidMatch ? uuidMatch[0] : "";

  // Remove UUID from the name if found
  if (uuid) {
    name = name.replace(`_${uuid}`, ""); // Remove UUID prefixed with an underscore
  }

  return { name, extension, uuid };
};

export { extractFileDetails };
export const pdfOptions = {
  // default is `save`
  method: "open",
  // default is Resolution.MEDIUM = 3, which should be enough, higher values
  // increases the image quality but also the size of the PDF, so be careful
  // using values higher than 10 when having multiple pages generated, it
  // might cause the page to crash or hang.
  resolution: Resolution.HIGH,
  page: {
    // margin is in MM, default is Margin.NONE = 0
    margin: Margin.SMALL,
    // default is 'A4'
    format: "letter",
    // default is 'portrait'
    orientation: "landscape",
  },
  canvas: {
    // default is 'image/jpeg' for better size performance
    mimeType: "image/png",
    qualityRatio: 1,
  },
  // Customize any value passed to the jsPDF instance and html2canvas
  // function. You probably will not need this and things can break,
  // so use with caution.
  overrides: {
    // see https://artskydj.github.io/jsPDF/docs/jsPDF.html for more options
    pdf: {
      compress: true,
    },
    // see https://html2canvas.hertzen.com/configuration for more options
    canvas: {
      useCORS: true,
    },
  },
};
function parseAddressManual(address: string) {
  console.log(address);
  const addressParts = address.match(
    /^(.*?),\s*(.*?),\s*([A-Z]{2}|\w+)\s*(\d{5})?$/i
  );
  console.log(addressParts);
  if (!addressParts) return null;

  return {
    street: addressParts[1],
    city: addressParts[2],
    state: addressParts[3],
    postalCode: addressParts[4],
  };
}

export { parseAddressManual };
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date
): { dateRange: string; summary: string } {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };

  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffDays =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Include both days

  let formattedDate: string;

  if (diffDays === 1) {
    // Single-day event: "March 15, 2025"
    formattedDate = start.toLocaleDateString("en-US", options);
  } else if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    // Same month & year: "March 15-17, 2025"
    formattedDate = `${start.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })}-${end.getDate()}, ${end.getFullYear()}`;
  } else {
    // Different month/year: "March 15, 2025 - April 2, 2025"
    formattedDate = `${start.toLocaleDateString(
      "en-US",
      options
    )} - ${end.toLocaleDateString("en-US", options)}`;
  }

  return {
    dateRange: formattedDate,
    summary: `${diffDays}`,
  };
}
