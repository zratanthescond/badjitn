/**
 * Catalog of file formats an event can accept for the final e-poster
 * ("Image « Soumission travail »"). Shared by the event form (choice),
 * the participant uploader (dropzone + badges), and the upload API (check).
 * Keys are what gets stored on the event (workAbstractConfig.posterFileTypes).
 */
export type PosterFileTypeKey = "jpg" | "png" | "webp" | "gif" | "pdf" | "pptx";

export type PosterFileType = {
  key: PosterFileTypeKey;
  label: string;
  /** Lower-case extensions, without the dot. */
  extensions: string[];
  /** MIME types, as react-dropzone's `accept` map expects them. */
  mimeTypes: string[];
  /** Can the browser show it with a plain <img>? */
  isImage: boolean;
};

export const POSTER_FILE_TYPES: PosterFileType[] = [
  { key: "jpg", label: "JPG", extensions: ["jpg", "jpeg"], mimeTypes: ["image/jpeg"], isImage: true },
  { key: "png", label: "PNG", extensions: ["png"], mimeTypes: ["image/png"], isImage: true },
  { key: "webp", label: "WEBP", extensions: ["webp"], mimeTypes: ["image/webp"], isImage: true },
  { key: "gif", label: "GIF", extensions: ["gif"], mimeTypes: ["image/gif"], isImage: true },
  { key: "pdf", label: "PDF", extensions: ["pdf"], mimeTypes: ["application/pdf"], isImage: false },
  {
    key: "pptx",
    label: "PowerPoint (PPTX)",
    extensions: ["pptx", "ppt"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
    ],
    isImage: false,
  },
];

/** What events accept when nothing is configured: the historical image-only set. */
export const DEFAULT_POSTER_FILE_TYPES: PosterFileTypeKey[] = ["jpg", "png", "webp"];

const byKey = new Map(POSTER_FILE_TYPES.map((t) => [t.key, t]));

/** Normalizes a stored list: drops unknown keys, falls back to the default when empty. */
export function resolvePosterFileTypes(keys?: string[] | null): PosterFileType[] {
  const valid = (keys || []).filter((k): k is PosterFileTypeKey => byKey.has(k as PosterFileTypeKey));
  const effective = valid.length ? valid : DEFAULT_POSTER_FILE_TYPES;
  return effective.map((k) => byKey.get(k)!);
}

export function posterExtensions(types: PosterFileType[]): string[] {
  return types.flatMap((t) => t.extensions);
}

export function isAllowedPosterFile(fileName: string, types: PosterFileType[]): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return posterExtensions(types).includes(ext);
}

/** react-dropzone `accept` map for the given formats. */
export function posterDropzoneAccept(types: PosterFileType[]): Record<string, string[]> {
  const accept: Record<string, string[]> = {};
  for (const t of types) {
    for (const mime of t.mimeTypes) {
      accept[mime] = t.extensions.map((e) => `.${e}`);
    }
  }
  return accept;
}

export function isImageExtension(ext?: string | null): boolean {
  const e = (ext || "").toLowerCase();
  return POSTER_FILE_TYPES.some((t) => t.isImage && t.extensions.includes(e));
}

/** Human list, e.g. "JPG, PNG, PowerPoint (PPTX)". */
export function posterFormatsLabel(types: PosterFileType[]): string {
  return types.map((t) => t.label).join(", ");
}
