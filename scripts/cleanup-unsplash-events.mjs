/**
 * Cleanup script – supprime les événements sans vraie photo (Unsplash générique)
 * Cible : organisation "Badgi Agenda Médical Tunisie" + imageUrl Unsplash
 * Run: node scripts/cleanup-unsplash-events.mjs
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
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
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

const OrganisationSchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true },
  isVerified: { type: Boolean, default: false },
});
const EventSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  organisation: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
});

const Organisation = mongoose.models.Organisation || mongoose.model("Organisation", OrganisationSchema);
const Event        = mongoose.models.Event        || mongoose.model("Event", EventSchema);

async function main() {
  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, { dbName: "badjitn", bufferCommands: false });
  console.log("✅  Connected\n");

  const org = await Organisation.findOne({ slug: "badgi-agenda-medical-tunisie" });
  if (!org) {
    console.error("❌  Organisation 'badgi-agenda-medical-tunisie' not found.");
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`🏢  Organisation: ${org.name} (${org._id})\n`);

  // Find all seeded events using generic Unsplash images
  const toDelete = await Event.find({
    organisation: org._id,
    imageUrl: { $regex: "^https://images\\.unsplash\\.com/" },
  }).lean();

  if (!toDelete.length) {
    console.log("✅  Aucun événement avec image Unsplash trouvé. Rien à supprimer.");
    await mongoose.disconnect();
    return;
  }

  console.log(`🗑  ${toDelete.length} événement(s) à supprimer :\n`);
  for (const ev of toDelete) {
    console.log(`  • ${ev.title.slice(0, 80)}`);
  }

  const ids = toDelete.map((e) => e._id);
  const result = await Event.deleteMany({ _id: { $in: ids } });
  console.log(`\n🎉  ${result.deletedCount} événement(s) supprimé(s).`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("💥  Erreur :", err.message || err);
  process.exit(1);
});
