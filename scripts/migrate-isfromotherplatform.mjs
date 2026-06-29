/**
 * Migration – set isFromOtherPlatform=true on all seeded events
 * (events belonging to "Badgi Agenda Médical Tunisie")
 * Run: node scripts/migrate-isfromotherplatform.mjs
 */
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
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch (_) {}
}
loadEnv(".env.local");
loadEnv(".env");

const OrganisationSchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true } });
const EventSchema = new mongoose.Schema({
  isFromOtherPlatform: { type: Boolean, default: false },
  organisation: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
});
const Organisation = mongoose.models.Organisation || mongoose.model("Organisation", OrganisationSchema);
const Event        = mongoose.models.Event        || mongoose.model("Event", EventSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "badjitn", bufferCommands: false });
  console.log("✅  Connected\n");

  const org = await Organisation.findOne({ slug: "badgi-agenda-medical-tunisie" });
  if (!org) { console.error("❌  Organisation not found"); process.exit(1); }

  const result = await Event.updateMany(
    { organisation: org._id },
    { $set: { isFromOtherPlatform: true } }
  );
  console.log(`✅  ${result.modifiedCount} event(s) updated → isFromOtherPlatform: true`);

  await mongoose.disconnect();
}
main().catch(console.error);
