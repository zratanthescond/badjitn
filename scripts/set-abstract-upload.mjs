// Toggle the "abstract file upload" section on an event's submit-work page.
//
//   node scripts/set-abstract-upload.mjs <eventId> on|off
//
// Sets workAbstractConfig.allowAbstractFileUpload on the event. Prints the
// value before and after so the change is visible. Reads MONGODB_URI from
// .env.local (then .env), like the other scripts in this folder.
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(file) {
  try {
    const content = readFileSync(resolve(__dirname, "..", file), "utf8");
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const key = t.slice(0, i).trim();
      const value = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* file optional */
  }
}
loadEnv(".env.local");
loadEnv(".env");

const [eventId, mode] = process.argv.slice(2);
if (!eventId || !["on", "off"].includes(mode)) {
  console.error("Usage: node scripts/set-abstract-upload.mjs <eventId> on|off");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing");
  process.exit(1);
}

const enabled = mode === "on";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "badjitn",
    bufferCommands: false,
  });
  const events = mongoose.connection.collection("events");
  const _id = new mongoose.Types.ObjectId(eventId);

  const before = await events.findOne(
    { _id },
    { projection: { title: 1, workAbstractConfig: 1 } }
  );
  if (!before) {
    console.error(`Event ${eventId} not found`);
    process.exit(1);
  }
  console.log(`Event : ${before.title}`);
  console.log(
    `Before: allowAbstractFileUpload = ${JSON.stringify(
      before.workAbstractConfig?.allowAbstractFileUpload ?? "(unset → true)"
    )}`
  );

  await events.updateOne(
    { _id },
    { $set: { "workAbstractConfig.allowAbstractFileUpload": enabled } }
  );

  const after = await events.findOne(
    { _id },
    { projection: { workAbstractConfig: 1 } }
  );
  console.log(
    `After : allowAbstractFileUpload = ${JSON.stringify(
      after.workAbstractConfig?.allowAbstractFileUpload
    )}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
