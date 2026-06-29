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

const UserSchema       = new mongoose.Schema({ firstName: String, lastName: String, username: String, photo: String, clerkId: String });
const CategorySchema   = new mongoose.Schema({ name: String });
const OrganisationSchema = new mongoose.Schema({ name: String, slug: String, logo: String, description: String, isVerified: Boolean });
const SponsorSchema    = new mongoose.Schema({});
const EventSchema = new mongoose.Schema({
  title: String,
  startDateTime: Date,
  endDateTime: Date,
  imageUrl: String,
  url: String,
  organizer:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category:     { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  organisation: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
  Sponsors:     [{ type: mongoose.Schema.Types.ObjectId, ref: "Sponsor" }],
});

const User         = mongoose.models.User         || mongoose.model("User",         UserSchema);
const Category     = mongoose.models.Category     || mongoose.model("Category",     CategorySchema);
const Organisation = mongoose.models.Organisation || mongoose.model("Organisation", OrganisationSchema);
const Sponsor      = mongoose.models.Sponsor      || mongoose.model("Sponsor",      SponsorSchema);
const Event        = mongoose.models.Event        || mongoose.model("Event",        EventSchema);

const populateEvent = (query) =>
  query
    .populate({ path: "organizer",    model: User,         select: "_id firstName lastName username photo clerkId" })
    .populate({ path: "category",     model: Category,     select: "_id name" })
    .populate({ path: "Sponsors",     model: Sponsor,      select: "_id" })
    .populate({ path: "organisation", model: Organisation, select: "_id name slug logo description isVerified" });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "badjitn", bufferCommands: false });

  // Simulate getAllEvents (page 1, limit 500, no filters)
  const events = await populateEvent(
    Event.find({}).sort({ startDateTime: "asc" }).skip(0).limit(500)
  );

  const plain = JSON.parse(JSON.stringify(events));

  console.log(`getAllEvents returned ${plain.length} events\n`);

  const TARGET = "6a4159f12528dffb5665d37b";
  const found = plain.find((e) => e._id === TARGET);

  if (!found) {
    console.log(`❌  Event ${TARGET} (AWGHO) is NOT in the getAllEvents result!`);
    console.log("    → Check for populate/serialization issues.\n");
  } else {
    console.log(`✅  Event ${TARGET} is in getAllEvents:`);
    console.log(`    title        : ${found.title}`);
    console.log(`    startDateTime: ${found.startDateTime}`);
    console.log(`    year (JS)    : ${new Date(found.startDateTime).getFullYear()}`);
    console.log(`    organisation : ${JSON.stringify(found.organisation)}`);
    console.log(`    organizer    : ${JSON.stringify(found.organizer)}`);
    console.log(`    category     : ${JSON.stringify(found.category)}`);
  }

  console.log("\n── 2026 events in getAllEvents result ─────────────────────────────");
  const events2026 = plain.filter((e) => new Date(e.startDateTime).getFullYear() === 2026);
  for (const e of events2026) {
    console.log(`  ${e._id}  ${(e.title || "").slice(0, 55)}`);
  }
  console.log(`\n2026 total: ${events2026.length}`);

  await mongoose.disconnect();
}
main().catch(console.error);
