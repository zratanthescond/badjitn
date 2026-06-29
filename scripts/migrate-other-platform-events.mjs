/**
 * Migration: mark all seeded events as isFromOtherPlatform = true
 * These are events from the "badgi-agenda-medical-tunisie" organisation
 *
 * Run: node scripts/migrate-other-platform-events.mjs
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
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch (_) {}
}
loadEnv(".env.local");
loadEnv(".env");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

const OrganisationSchema = new mongoose.Schema({ slug: String });
const EventSchema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
  isFromOtherPlatform: { type: Boolean, default: false },
});

const Organisation = mongoose.models.Organisation || mongoose.model("Organisation", OrganisationSchema);
const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

// Add slugs of all Badgi-owned aggregator organisations here
const AGGREGATOR_SLUGS = ["badgi-agenda-medical-tunisie"];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅  Connected to MongoDB");

  const orgs = await Organisation.find({ slug: { $in: AGGREGATOR_SLUGS } }, { _id: 1, slug: 1 }).lean();

  if (!orgs.length) {
    console.log("⚠️  No aggregator organisations found. Check the slugs in AGGREGATOR_SLUGS.");
    await mongoose.disconnect();
    return;
  }

  for (const org of orgs) {
    const result = await Event.updateMany(
      { organisation: org._id, isFromOtherPlatform: { $ne: true } },
      { $set: { isFromOtherPlatform: true } }
    );
    console.log(`📌  [${org.slug}] → ${result.modifiedCount} event(s) marked as isFromOtherPlatform`);
  }

  console.log("\n🎉  Migration complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("💥  Error:", err.message || err);
  process.exit(1);
});
