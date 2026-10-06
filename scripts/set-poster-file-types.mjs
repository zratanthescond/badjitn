// Set the accepted formats for an event's final e-poster.
//
//   node scripts/set-poster-file-types.mjs <eventId> <types>
//   e.g. node scripts/set-poster-file-types.mjs 6a7b... pptx
//        node scripts/set-poster-file-types.mjs 6a7b... jpg,png,webp,pptx
//        node scripts/set-poster-file-types.mjs 6a7b... default   (unset → jpg/png/webp)
//
// Keys: jpg, png, webp, gif, pdf, pptx (see lib/poster-file-types.ts).
// Prints the value before and after.
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv(file) {
  try {
    for (const line of readFileSync(resolve(__dirname, "..", file), "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      if (!(k in process.env)) process.env[k] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}
loadEnv(".env.local");
loadEnv(".env");

const KNOWN = ["jpg", "png", "webp", "gif", "pdf", "pptx"];
const [eventId, typesArg] = process.argv.slice(2);
if (!eventId || !typesArg) {
  console.error("Usage: node scripts/set-poster-file-types.mjs <eventId> <jpg,png,...|default>");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing");
  process.exit(1);
}
const types =
  typesArg === "default"
    ? null
    : typesArg.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
if (types) {
  const bad = types.filter((t) => !KNOWN.includes(t));
  if (bad.length) {
    console.error(`Unknown type(s): ${bad.join(", ")}. Known: ${KNOWN.join(", ")}`);
    process.exit(1);
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "badjitn", bufferCommands: false });
  const events = mongoose.connection.collection("events");
  const _id = new mongoose.Types.ObjectId(eventId);

  const before = await events.findOne({ _id }, { projection: { title: 1, workAbstractConfig: 1 } });
  if (!before) {
    console.error(`Event ${eventId} not found`);
    process.exit(1);
  }
  console.log(`Event : ${before.title}`);
  console.log(`Before: posterFileTypes = ${JSON.stringify(before.workAbstractConfig?.posterFileTypes ?? "(unset → jpg,png,webp)")}`);

  await events.updateOne(
    { _id },
    types
      ? { $set: { "workAbstractConfig.posterFileTypes": types } }
      : { $unset: { "workAbstractConfig.posterFileTypes": "" } }
  );

  const after = await events.findOne({ _id }, { projection: { workAbstractConfig: 1 } });
  console.log(`After : posterFileTypes = ${JSON.stringify(after.workAbstractConfig?.posterFileTypes ?? "(unset → jpg,png,webp)")}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
