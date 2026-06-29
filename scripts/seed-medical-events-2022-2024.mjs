/**
 * Seed script – Événements médicaux Tunisie 2022-2024 (avec vraies affiches)
 * Run: node scripts/seed-medical-events-2022-2024.mjs
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

const UserSchema = new mongoose.Schema({
  clerkId: String, email: String, username: String,
  firstName: String, lastName: String, photo: String,
  role: { type: String, default: "user" },
});
const CategorySchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } });
const OrganisationSchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true },
  description: String, logo: String, website: String,
  creator: mongoose.Schema.Types.ObjectId,
  admins: [mongoose.Schema.Types.ObjectId],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const pricePlanSchema = new mongoose.Schema({
  name: String, price: Number, places: Number, note: String,
  options: { type: [String], default: [] },
});
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: { name: String, lon: Number, lat: Number },
  city: String, village: String, country: String,
  imageUrl: { type: String, required: true },
  startDateTime: { type: Date, default: Date.now },
  endDateTime:   { type: Date, default: Date.now },
  price: String, isFree: { type: Boolean, default: false },
  url: String, isOnline: Boolean,
  category:     { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  organizer:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  organisation: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation", required: true },
  restricted: { type: Boolean, default: false },
  allowGuestRegistration: { type: Boolean, default: true },
  showProfileButton: { type: Boolean, default: true },
  showReturnButton:  { type: Boolean, default: true },
  pricePlan: { type: [pricePlanSchema], default: [] },
  sponsors:  { type: [String], default: [] },
  scanPoints: { type: [String], default: [] },
  requiredInfo: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const User         = mongoose.models.User         || mongoose.model("User",         UserSchema);
const Category     = mongoose.models.Category     || mongoose.model("Category",     CategorySchema);
const Organisation = mongoose.models.Organisation || mongoose.model("Organisation", OrganisationSchema);
const Event        = mongoose.models.Event        || mongoose.model("Event",        EventSchema);

const LOC = {
  tunis:    { lon: 10.1815, lat: 36.8065 },
  hammamet: { lon: 10.5613, lat: 36.3996 },
  sousse:   { lon: 10.6369, lat: 35.8249 },
  monastir: { lon: 10.8113, lat: 35.7643 },
  sfax:     { lon: 10.7600, lat: 34.7398 },
  djerba:   { lon: 10.8451, lat: 33.8075 },
};

// Only events with confirmed real poster images (no Unsplash generics)
const EVENTS = [
  // ═══════════ 2022 ═══════════
  {
    title: "42ème Congrès National de la STCCCV – 50ème Anniversaire",
    description: "Le 42ème Congrès National de la Société Tunisienne de Cardiologie et de Chirurgie Cardiovasculaire (STCCCV), coïncidant avec le 50ème anniversaire de la société. Grand rendez-vous de la cardiologie tunisienne : insuffisance cardiaque, cardiologie interventionnelle, électrophysiologie, chirurgie cardiovasculaire et imagerie cardiaque.",
    startDateTime: new Date("2022-11-17T08:00:00"),
    endDateTime:   new Date("2022-11-19T18:00:00"),
    location: { name: "Palais des Congrès de Tunis", ...LOC.tunis },
    city: "Tunis", country: "TUN",
    cat: "cardiology",
    imageUrl: "https://www.stcccv.org.tn/uploads/images/017b0475ca752dda5dbac6c4762ec63f.jpeg",
    url: "https://www.stcccv.org.tn/Home/evenement/96/detail",
    price: "250",
  },
  {
    title: "21ème Congrès d'Ophtalmologie de Monastir",
    description: "Congrès annuel du service d'ophtalmologie de Monastir sous l'égide de l'Association de Promotion de l'Ophtalmologie à Monastir (APOM). Nouvelles techniques chirurgicales, pathologies rétiniennes, glaucome et ophtalmologie pédiatrique.",
    startDateTime: new Date("2022-11-11T08:00:00"),
    endDateTime:   new Date("2022-11-12T18:00:00"),
    location: { name: "Hôtel Rosa Beach, Monastir", ...LOC.monastir },
    city: "Monastir", country: "TUN",
    cat: "ophthalmology",
    imageUrl: "https://congres.stageprod.net/wp-content/uploads/2022/08/Affiche1-pdf.jpg",
    url: "https://congres.stageprod.net/events/21eme-congres-dophtalmologie-de-monastir/",
    price: "150",
  },
  // ═══════════ 2023 ═══════════
  {
    title: "XXème Journée de Neurologie du Centre – JNC 2023",
    description: "20ème édition de la journée scientifique annuelle de neurologie clinique organisée pour les praticiens de la région Centre. Cas cliniques interactifs, mises au point thérapeutiques et actualités en neurologie : SEP, épilepsie, AVC et maladies neurodégénératives.",
    startDateTime: new Date("2023-04-28T08:00:00"),
    endDateTime:   new Date("2023-04-29T18:00:00"),
    location: { name: "Hôtel Kantaoui Bay, Sousse", ...LOC.sousse },
    city: "Sousse", country: "TUN",
    cat: "neurology",
    imageUrl: "https://congres.stageprod.net/wp-content/uploads/2023/02/Artboard-2-copie-2.png",
    url: "https://congres.stageprod.net/events/preprogramme-de-xxeme-journee-de-neurologie-de-centre/",
    price: "100",
  },
  {
    title: "2ème Rencontres de Pédiatrie Pratique du Cap Bon",
    description: "Journées régionales de pédiatrie pratique organisées par l'Association de Pédiatrie du Cap Bon. Cas cliniques interactifs, formations pratiques et échanges entre pédiatres et médecins généralistes autour des urgences pédiatriques et des pathologies courantes de l'enfant.",
    startDateTime: new Date("2023-05-13T08:00:00"),
    endDateTime:   new Date("2023-05-14T18:00:00"),
    location: { name: "Hôtel Golden Tulip Taj Sultan, Hammamet", ...LOC.hammamet },
    city: "Hammamet", country: "TUN",
    cat: "pediatricMedicine",
    imageUrl: "https://congres.stageprod.net/wp-content/uploads/2023/03/Copie-de-Blue-Green-Medical-Poster-3_page-0001-scaled.jpg",
    url: "https://congres.stageprod.net/events/2-eme-rencontres-de-pediatrie-pratique-du-cap-bon/",
    price: "80",
  },
  {
    title: "34ème Congrès d'Ophtalmologie de Sfax",
    description: "Congrès annuel de l'Association des Ophtalmologistes de Sfax. Présentations d'experts nationaux et internationaux, e-posters sélectionnés et ateliers pratiques en ophtalmologie clinique et chirurgicale. Chirurgie réfractive, rétine médicale et glaucome.",
    startDateTime: new Date("2023-10-13T08:00:00"),
    endDateTime:   new Date("2023-10-14T18:00:00"),
    location: { name: "Hôtel Occidental Sfax Centre, Sfax", ...LOC.sfax },
    city: "Sfax", country: "TUN",
    cat: "ophthalmology",
    imageUrl: "https://congres.stageprod.net/wp-content/uploads/2023/09/Affiche.png",
    url: "https://congres.stageprod.net/events/34eme-congres-dophtalmologie-de-sfax/",
    price: "120",
  },
  // ═══════════ 2024 ═══════════
  {
    title: "12ème Journée Pharmaceutique du CROPT",
    description: "Journée scientifique annuelle du Conseil Régional de l'Ordre des Pharmaciens de Tunis (CROPT). Mises à jour réglementaires, pharmacovigilance, interactions médicamenteuses, nouvelles molécules et pratique officinale moderne.",
    startDateTime: new Date("2024-01-19T08:00:00"),
    endDateTime:   new Date("2024-01-20T18:00:00"),
    location: { name: "Sheraton Tunis Hotel, Tunis", ...LOC.tunis },
    city: "Tunis", country: "TUN",
    cat: "generalMedicine",
    imageUrl: "https://congres.stageprod.net/wp-content/uploads/2024/01/cropt-affiche.png",
    url: "https://congres.stageprod.net/events/12eme-journee-pharmaceutique-cropt/",
    price: "80",
  },
  {
    title: "4ème Printemps de l'APLS – Pédiatrie Pratique Sousse",
    description: "Congrès interactif et solidaire organisé par l'Association des Pédiatres Libéraux de Sousse (APLS). Échanges de pratiques, cas cliniques filmés et soutien aux initiatives caritatives pour enfants vulnérables. Formation médicale continue en pédiatrie ambulatoire.",
    startDateTime: new Date("2024-04-27T08:00:00"),
    endDateTime:   new Date("2024-04-28T18:00:00"),
    location: { name: "Hôtel Sentido Bellevue Park, Sousse", ...LOC.sousse },
    city: "Sousse", country: "TUN",
    cat: "pediatricMedicine",
    imageUrl: "https://congres.stageprod.net/wp-content/uploads/2024/01/LE-4-PRINTEMPS.png",
    url: "https://congres.stageprod.net/events/le-4eme-printemps-de-lapls/",
    price: "80",
  },
  {
    title: "22ème Congrès d'Ophtalmologie de Monastir",
    description: "22ème édition du congrès annuel de l'Association de Promotion de l'Ophtalmologie à Monastir (APOM). Chirurgie de la cataracte, glaucome, rétine médicale et chirurgicale, ophtalmologie pédiatrique avec la participation d'experts nationaux et internationaux.",
    startDateTime: new Date("2024-10-18T08:00:00"),
    endDateTime:   new Date("2024-10-19T18:00:00"),
    location: { name: "Hôtel Rosa Beach, Monastir", ...LOC.monastir },
    city: "Monastir", country: "TUN",
    cat: "ophthalmology",
    imageUrl: "https://congres.stageprod.net/wp-content/uploads/2024/09/Affiche-APOM-2024.png",
    url: "https://congres.stageprod.net/events/22eme-congres-dophtalmologie-de-monastir/",
    price: "150",
  },
  {
    title: "44ème Congrès National de la STCCCV – Cardiologie & Chirurgie Cardiovasculaire",
    description: "44ème édition du Congrès National de la Société Tunisienne de Cardiologie et de Chirurgie Cardiovasculaire (STCCCV). Cardiologie interventionnelle, insuffisance cardiaque avancée, électrophysiologie, imagerie cardiaque et chirurgie cardiovasculaire.",
    startDateTime: new Date("2024-11-21T08:00:00"),
    endDateTime:   new Date("2024-11-23T18:00:00"),
    location: { name: "Palais des Congrès Laico, Tunis", ...LOC.tunis },
    city: "Tunis", country: "TUN",
    cat: "cardiology",
    imageUrl: "https://www.stcccv.org.tn/uploads/images/ebc4c8598a117d0157627f51c7aeee32.jpeg",
    url: "https://www.stcccv.org.tn/Home/evenement/137/detail",
    price: "280",
  },
];

async function main() {
  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, { dbName: "badjitn", bufferCommands: false });
  console.log("✅  Connected\n");

  const admin = await User.findOne({ role: "admin" }).lean();
  if (!admin) {
    console.error("❌  No admin user found.");
    process.exit(1);
  }
  console.log(`👤  Admin: ${admin.email} (${admin._id})`);

  const ORG_SLUG = "badgi-agenda-medical-tunisie";
  let org = await Organisation.findOne({ slug: ORG_SLUG });
  if (!org) {
    org = await Organisation.create({
      name: "Badgi Agenda Médical Tunisie",
      slug: ORG_SLUG,
      description: "Agenda officiel des congrès et événements médicaux en Tunisie – Badgi.net",
      logo: "https://badgi.net/assets/images/logo.png",
      website: "https://badgi.net",
      creator: admin._id,
      admins: [admin._id],
      isVerified: true,
    });
    console.log(`🏢  Organisation créée : ${org.name}`);
  } else {
    console.log(`🏢  Organisation existante : ${org.name}`);
  }

  const catKeys = [...new Set(EVENTS.map((e) => e.cat))];
  const existingCats = await Category.find({ name: { $in: catKeys } }).lean();
  const existingKeys = existingCats.map((c) => c.name);
  const missing = catKeys.filter((k) => !existingKeys.includes(k));
  if (missing.length) {
    await Category.insertMany(missing.map((name) => ({ name })));
    console.log(`📂  Catégories créées : ${missing.join(", ")}`);
  }
  const allCats = await Category.find({ name: { $in: catKeys } }).lean();
  const catMap = Object.fromEntries(allCats.map((c) => [c.name, c._id]));

  const existingTitles = (
    await Event.find({ organisation: org._id }, { title: 1 }).lean()
  ).map((e) => e.title);

  let created = 0, skipped = 0;
  for (const ev of EVENTS) {
    if (existingTitles.includes(ev.title)) { skipped++; continue; }
    const { cat, ...rest } = ev;
    await Event.create({
      ...rest,
      category: catMap[cat],
      organizer: admin._id,
      organisation: org._id,
      isFree: false,
      restricted: false,
      allowGuestRegistration: true,
      showProfileButton: true,
      showReturnButton: true,
      isFromOtherPlatform: true,
    });
    console.log(`  ✔  ${ev.title.slice(0, 75)}`);
    created++;
  }

  console.log(`\n🎉  Terminé — ${created} événement(s) créé(s), ${skipped} ignoré(s) (doublon).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("💥  Erreur :", err.message || err);
  process.exit(1);
});
