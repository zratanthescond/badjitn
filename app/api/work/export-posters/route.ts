import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, writeFile, readFile, readdir, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import JSZip from "jszip";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 300;

const run = promisify(execFile);

type Format = "jpeg" | "pdf" | "pptx";
type Item = { number: number; urls: string[] };

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const ALLOWED_HOSTS = ["fileserver.badgi.net", "utfs.io"];

const extOf = (url: string) =>
  (url.split("?")[0].split("#")[0].split(".").pop() || "").toLowerCase();

/** Only fetch from the app's own file hosts (this route is a server-side fetcher). */
function isAllowedUrl(url: string) {
  try {
    const u = new URL(url);
    const extra = (process.env.NEXT_PUBLIC_FILE_SERVER_URL || "").replace(/\/$/, "");
    const extraHost = extra ? new URL(extra).hostname : "";
    return (
      u.protocol === "https:" &&
      (ALLOWED_HOSTS.includes(u.hostname) || (extraHost !== "" && u.hostname === extraHost))
    );
  } catch {
    return false;
  }
}

/** LibreOffice (pptx/ppt -> pdf) and poppler (pdf -> jpeg) are optional system tools. */
async function officeToPdf(input: Buffer, ext: string): Promise<Buffer> {
  const dir = await mkdtemp(path.join(tmpdir(), "poster-"));
  try {
    const src = path.join(dir, `in.${ext}`);
    await writeFile(src, input);
    await run(
      process.env.SOFFICE_PATH || "soffice",
      [
        `-env:UserInstallation=file://${dir.replace(/\\/g, "/")}/profile`,
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        dir,
        src,
      ],
      { timeout: 120_000 }
    );
    return await readFile(path.join(dir, "in.pdf"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      throw new Error("conversion PowerPoint indisponible sur le serveur (LibreOffice non installé)");
    }
    throw err;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function pdfToJpegs(input: Buffer): Promise<Buffer[]> {
  const dir = await mkdtemp(path.join(tmpdir(), "poster-"));
  try {
    await writeFile(path.join(dir, "in.pdf"), input);
    await run(
      process.env.PDFTOPPM_PATH || "pdftoppm",
      ["-jpeg", "-jpegopt", "quality=92", "-r", "150", path.join(dir, "in.pdf"), path.join(dir, "page")],
      { timeout: 120_000 }
    );
    const files = (await readdir(dir)).filter((f) => f.startsWith("page") && f.endsWith(".jpg")).sort();
    return await Promise.all(files.map((f) => readFile(path.join(dir, f))));
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      throw new Error("conversion PDF -> image indisponible sur le serveur (poppler-utils non installé)");
    }
    throw err;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function imageToPdf(input: Buffer): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const jpeg = await sharp(input).rotate().flatten({ background: "#ffffff" }).jpeg({ quality: 92 }).toBuffer();
  const meta = await sharp(jpeg).metadata();
  const w = meta.width || 1000;
  const h = meta.height || 1000;
  const doc = new jsPDF({ unit: "px", format: [w, h], orientation: w >= h ? "landscape" : "portrait", compress: true });
  doc.addImage(jpeg.toString("base64"), "JPEG", 0, 0, w, h);
  return Buffer.from(doc.output("arraybuffer"));
}

async function imageToPptx(input: Buffer): Promise<Buffer> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const jpeg = await sharp(input).rotate().flatten({ background: "#ffffff" }).jpeg({ quality: 92 }).toBuffer();
  const meta = await sharp(jpeg).metadata();
  const ratio = (meta.width || 1) / (meta.height || 1);
  const pptx = new PptxGenJS();
  const maxW = 13.33;
  const maxH = 7.5;
  const width = ratio >= maxW / maxH ? maxW : maxH * ratio;
  const height = width / ratio;
  pptx.defineLayout({ name: "POSTER", width, height });
  pptx.layout = "POSTER";
  pptx.addSlide().addImage({ data: `image/jpeg;base64,${jpeg.toString("base64")}`, x: 0, y: 0, w: width, h: height });
  return (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
}

/** Converts one downloaded poster file to the target format. Returns [{ext, data}] (several for multi-page JPEG). */
async function convert(buf: Buffer, srcExt: string, format: Format): Promise<{ ext: string; data: Buffer }[]> {
  const isImage = IMAGE_EXT.has(srcExt);
  const isOffice = srcExt === "pptx" || srcExt === "ppt";
  const isPdf = srcExt === "pdf";

  if (format === "pptx") {
    if (isOffice) return [{ ext: srcExt, data: buf }];
    if (isImage) return [{ ext: "pptx", data: await imageToPptx(buf) }];
    throw new Error("un PDF ne peut pas être converti en PowerPoint");
  }
  if (format === "pdf") {
    if (isPdf) return [{ ext: "pdf", data: buf }];
    if (isOffice) return [{ ext: "pdf", data: await officeToPdf(buf, srcExt) }];
    if (isImage) return [{ ext: "pdf", data: await imageToPdf(buf) }];
  }
  if (format === "jpeg") {
    if (srcExt === "jpg" || srcExt === "jpeg") return [{ ext: "jpg", data: buf }];
    if (isImage) return [{ ext: "jpg", data: await sharp(buf).rotate().flatten({ background: "#ffffff" }).jpeg({ quality: 92 }).toBuffer() }];
    const pdf = isPdf ? buf : isOffice ? await officeToPdf(buf, srcExt) : null;
    if (pdf) return (await pdfToJpegs(pdf)).map((data) => ({ ext: "jpg", data }));
  }
  throw new Error(`format source non pris en charge (.${srcExt})`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const format: Format = body.format === "pdf" || body.format === "pptx" ? body.format : "jpeg";
    const items: Item[] = (Array.isArray(body.items) ? body.items : [])
      .map((i: any) => ({
        number: Number(i?.number),
        urls: Array.isArray(i?.urls) ? i.urls.filter((u: unknown) => typeof u === "string") : [],
      }))
      .filter((i: Item) => Number.isInteger(i.number) && i.number > 0 && i.urls.length > 0)
      .slice(0, 300);
    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Aucun e-poster à exporter" }, { status: 400 });
    }

    const out: { name: string; data: Buffer }[] = [];
    const errors: string[] = [];

    // Posters are converted one at a time: LibreOffice is heavy and not safe to run in bulk in parallel.
    for (const item of items) {
      let fileIndex = 0;
      for (const url of item.urls) {
        fileIndex += 1;
        try {
          if (!isAllowedUrl(url)) throw new Error("hôte de fichier non autorisé");
          const res = await fetch(url);
          if (!res.ok) throw new Error(`téléchargement impossible (${res.status})`);
          const buf = Buffer.from(await res.arrayBuffer());
          const parts = await convert(buf, extOf(url), format);
          parts.forEach((p, pageIndex) => {
            const suffix = [fileIndex > 1 ? String(fileIndex) : "", pageIndex > 0 ? `p${pageIndex + 1}` : ""]
              .filter(Boolean)
              .join("-");
            out.push({ name: `${item.number}${suffix ? `-${suffix}` : ""}.${p.ext}`, data: p.data });
          });
        } catch (err) {
          errors.push(`${item.number}: ${err instanceof Error ? err.message : "échec"}`);
        }
      }
    }

    if (out.length === 0) {
      return NextResponse.json({ success: false, error: errors[0] || "Échec de l'export", errors }, { status: 422 });
    }

    const headers: Record<string, string> = {
      "Access-Control-Expose-Headers": "X-Filename, X-Export-Errors",
      "X-Export-Errors": encodeURIComponent(errors.join(" | ").slice(0, 1500)),
    };

    if (out.length === 1 && errors.length === 0) {
      headers["X-Filename"] = out[0].name;
      headers["Content-Type"] = "application/octet-stream";
      return new NextResponse(new Uint8Array(out[0].data), { headers });
    }

    const zip = new JSZip();
    out.forEach((f) => zip.file(f.name, f.data));
    if (errors.length) zip.file("_erreurs.txt", errors.join("\n"));
    const data = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
    headers["X-Filename"] = "e-posters.zip";
    headers["Content-Type"] = "application/zip";
    return new NextResponse(data as BodyInit, { headers });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Échec de l'export" },
      { status: 500 }
    );
  }
}
