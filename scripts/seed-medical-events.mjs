/**
 * Seed script – Événements médicaux Tunisie 2025-2026
 * Run: node scripts/seed-medical-events.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ──────────────────────────────────────────────────────────
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
  } catch (_) { /* file not found */ }
}
loadEnv(".env.local");
loadEnv(".env");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

// ── Mongoose schemas (inline, minimal) ────────────────────────────────────────
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

// ── Location helpers ──────────────────────────────────────────────────────────
const LOC = {
  tunis:    { lon: 10.1815, lat: 36.8065 },
  hammamet: { lon: 10.5613, lat: 36.3996 },
  sousse:   { lon: 10.6369, lat: 35.8249 },
  monastir: { lon: 10.8113, lat: 35.7643 },
  sfax:     { lon: 10.7600, lat: 34.7398 },
  djerba:   { lon: 10.8451, lat: 33.8075 },
  korba:    { lon: 10.8550, lat: 36.5775 },
};

// ── Images ────────────────────────────────────────────────────────────────────
// Real event poster thumbnails (congres.stageprod.net) + Unsplash medical photos
const IMG = {
  a3p:       "https://congres.stageprod.net/wp-content/uploads/2025/08/11eme-CongresA3P-1-300x300.jpg",
  jnc2025:   "https://congres.stageprod.net/wp-content/uploads/2025/09/affiche-jnc2025-300x300.png",
  gyneco:    "https://congres.stageprod.net/wp-content/uploads/2025/08/Deadline-05-oct-2025-300x300.jpg",
  pedcapbon: "https://congres.stageprod.net/wp-content/uploads/2025/08/APPC-3-300x300.png",
  derma:     "https://congres.stageprod.net/wp-content/uploads/2025/08/save-the-date-dar-phro-300x300.png",
  atoc:      "https://congres.stageprod.net/wp-content/uploads/2025/11/Affiche-ATOC-2026-300x300.jpg",
  sspt:      "https://congres.stageprod.net/wp-content/uploads/2026/01/SSPT-PROGRAMME--300x300.jpg",
  iwh:       "https://congres.stageprod.net/wp-content/uploads/2025/12/aff4IWH-300x300.png",
  pedMag:    "https://congres.stageprod.net/wp-content/uploads/2025/12/societe.tunisienne.pediatrie@gmail.com_-1448x2048-1-300x300.webp",
  jnc2026:   "https://congres.stageprod.net/wp-content/uploads/2026/04/Affiche-JNC-2026-Affiche-portrait-A3Affiche-JNC26-1-300x300.png",
  pedSfax:   "https://congres.stageprod.net/wp-content/uploads/2026/04/Capture-decran-2026-04-23-a-9.51.26%20AM-205x300.png",
  cardio:    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
  pulmo:     "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
  emergency: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80",
  infect:    "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80",
  general:   "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  anestho:   "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80",
  pediatric: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80",
  geriatric: "https://images.unsplash.com/photo-1556821840-3a63f15732d2?w=800&q=80",
  nephro:    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  pharma:    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  neurology: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
  repro:     "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80",
};

// ── Events data ───────────────────────────────────────────────────────────────
const EVENTS = [
  // ═══════════ 2025 ═══════════
  {
    title: "AFRAN 2025 – 18ème Congrès de l'Association Africaine de Néphrologie",
    description: "Le 18ème Congrès de l'Association Africaine de Néphrologie (AFRAN) réunit des néphrologues de toute l'Afrique et de la diaspora pour partager les dernières avancées en médecine rénale, dialyse et transplantation.",
    startDateTime: new Date("2025-04-15T08:00:00"), endDateTime: new Date("2025-04-17T18:00:00"),
    location: { name: "Hôtel El Mouradi, Tunis", ...LOC.tunis }, city: "Tunis", country: "TUN",
    cat: "nephrology", imageUrl: IMG.nephro, price: "200",
  },
  {
    title: "34ème Congrès National STPI & 1er Congrès MENA de Microbiologie Clinique",
    description: "Premier congrès MENA conjoint de microbiologie clinique et de pathologie infectieuse organisé par la Société Tunisienne de Pathologie Infectieuse. Experts de 20 pays, nouvelles stratégies diagnostiques et thérapeutiques face aux pathogènes émergents.",
    startDateTime: new Date("2025-05-22T08:00:00"), endDateTime: new Date("2025-05-24T18:00:00"),
    location: { name: "Hôtel Russelior, Hammamet Yasmine", ...LOC.hammamet }, city: "Hammamet", country: "TUN",
    cat: "infectiousDiseases", imageUrl: IMG.infect, price: "150",
  },
  {
    title: "11ème Congrès A3P Tunisie – Anesthésie, Analgésie & Périopératoire",
    description: "Congrès annuel de l'Association des Anesthésistes-réanimateurs du Privé et du Public de Tunisie (A3P). Ateliers pratiques, sessions scientifiques et formation continue en anesthésie-réanimation.",
    startDateTime: new Date("2025-09-11T08:00:00"), endDateTime: new Date("2025-09-12T18:00:00"),
    location: { name: "Hôtel Hasdrubal, Hammamet", ...LOC.hammamet }, city: "Hammamet", country: "TUN",
    cat: "anesthesiology", imageUrl: IMG.a3p, price: "180",
  },
  {
    title: "XXIIème Journée de Neurologie du Centre – JNC 2025",
    description: "Journée scientifique organisée par la Société Tunisienne de Neurologie pour les neurologues de la région Centre. Cas cliniques, mises au point et nouvelles thérapeutiques en neurologie.",
    startDateTime: new Date("2025-09-20T08:00:00"), endDateTime: new Date("2025-09-20T18:00:00"),
    location: { name: "Hôtel Movenpick, Sousse", ...LOC.sousse }, city: "Sousse", country: "TUN",
    cat: "neurology", imageUrl: IMG.jnc2025, price: "100",
  },
  {
    title: "Congrès National STAAR 2025 – Anesthésie & Réanimation",
    description: "Congrès annuel de la Société Tunisienne d'Anesthésie, Analgésie et Réanimation (STAAR). Simulation médicale haute-fidélité, ateliers pratiques et conférences de haut niveau en anesthésie et soins intensifs.",
    startDateTime: new Date("2025-10-02T08:00:00"), endDateTime: new Date("2025-10-04T18:00:00"),
    location: { name: "Hôtel The Russelior, Hammamet", ...LOC.hammamet }, city: "Hammamet", country: "TUN",
    cat: "anesthesiology", imageUrl: IMG.anestho, price: "200",
  },
  {
    title: "8ème Congrès de Médecine du Sommeil – STMS 2025",
    description: "La Société Tunisienne de Médecine du Sommeil organise son 8ème congrès national. Troubles respiratoires du sommeil, insomnie, somnolence excessive et neurosciences du sommeil. Ateliers de polysomnographie.",
    startDateTime: new Date("2025-10-09T08:00:00"), endDateTime: new Date("2025-10-11T18:00:00"),
    location: { name: "Hôtel The Russelior Royal, Hammamet", ...LOC.hammamet }, city: "Hammamet", country: "TUN",
    cat: "neurology", imageUrl: IMG.neurology, price: "160",
  },
  {
    title: "8ème Congrès National de Médecine Générale et de Médecine de Famille – CNMGF 2025",
    description: "Grand rendez-vous annuel de la médecine de première ligne en Tunisie organisé par la STMGF. Réunit praticiens et spécialistes autour de la prise en charge holistique du patient en médecine générale et familiale.",
    startDateTime: new Date("2025-10-23T08:00:00"), endDateTime: new Date("2025-10-25T18:00:00"),
    location: { name: "El Médina Yasmine Convention Centre, Hammamet", ...LOC.hammamet }, city: "Hammamet", country: "TUN",
    cat: "generalMedicine", imageUrl: IMG.general, price: "150",
  },
  {
    title: "12ème Congrès du Collège Tunisien de Gynécologie Obstétrique – CTGO 2025",
    description: "Congrès dédié à la gynécologie, l'obstétrique et la médecine reproductive. Procréation médicalement assistée, oncologie gynécologique, chirurgie laparoscopique et suivi de grossesse à risque.",
    startDateTime: new Date("2025-10-24T08:00:00"), endDateTime: new Date("2025-10-25T18:00:00"),
    location: { name: "Hôtel Sousse Palace, Sousse", ...LOC.sousse }, city: "Sousse", country: "TUN",
    cat: "reproductiveMedicine", imageUrl: IMG.gyneco, price: "180",
  },
  {
    title: "3èmes Rencontres de Pédiatrie Pratique du Cap Bon – APPC 2025",
    description: "Journées régionales de pédiatrie pratique organisées par l'Association de Pédiatrie Pratique du Cap Bon. Cas cliniques, ateliers et mises à jour thérapeutiques pour pédiatres et médecins généralistes.",
    startDateTime: new Date("2025-11-15T08:00:00"), endDateTime: new Date("2025-11-16T18:00:00"),
    location: { name: "Africa Jade Thalasso Hôtel, Korba", ...LOC.korba }, city: "Korba", country: "TUN",
    cat: "pediatricMedicine", imageUrl: IMG.pedcapbon, price: "100",
  },
  {
    title: "45ème Congrès National de la STCCCV – Cardiologie & Chirurgie Cardiovasculaire",
    description: "Le plus grand congrès de cardiologie en Tunisie organisé par la Société Tunisienne de Cardiologie et de Chirurgie Cardiovasculaire (STCCCV). Innovation en cardiologie interventionnelle, électrophysiologie, échocardiographie et chirurgie cardiaque.",
    startDateTime: new Date("2025-11-20T08:00:00"), endDateTime: new Date("2025-11-22T18:00:00"),
    location: { name: "Radisson Congress Centre, Tunis", ...LOC.tunis }, city: "Tunis", country: "TUN",
    cat: "cardiology", imageUrl: IMG.cardio, price: "300",
  },
  {
    title: "29ème Congrès National de Pneumologie – STMRA 2025",
    description: "Congrès annuel de la Société Tunisienne des Maladies Respiratoires et d'Allergologie (STMRA). Asthme, BPCO, cancer bronchique, pneumopathies interstitielles, apnée du sommeil et allergologie respiratoire.",
    startDateTime: new Date("2025-11-27T08:00:00"), endDateTime: new Date("2025-11-29T18:00:00"),
    location: { name: "Hôtel Movënpick-Lac 1, Tunis", ...LOC.tunis }, city: "Tunis", country: "TUN",
    cat: "pulmonology", imageUrl: IMG.pulmo, price: "250",
  },
  {
    title: "Congrès National ATR 2025 – Association Tunisienne de Réanimation",
    description: "Congrès de l'Association Tunisienne de Réanimation dédié à la médecine intensive et aux soins critiques. Simulations haute-fidélité, controverses thérapeutiques et présentation des derniers protocoles de réanimation.",
    startDateTime: new Date("2025-11-27T08:00:00"), endDateTime: new Date("2025-11-29T18:00:00"),
    location: { name: "Hôtel The Russelior, Hammamet", ...LOC.hammamet }, city: "Hammamet", country: "TUN",
    cat: "internalMedicine", imageUrl: IMG.anestho, price: "200",
  },
  {
    title: "3ème Congrès DAR Francophone & Journée d'Hiver STEDIAM 2025 – Dermatologie",
    description: "Congrès bilingue franco-tunisien en dermatologie et allergologie organisé par la STEDIAM. Dermatologie clinique, oncologie cutanée, dermatologie esthétique et nouvelles biothérapies.",
    startDateTime: new Date("2025-12-19T08:00:00"), endDateTime: new Date("2025-12-20T18:00:00"),
    location: { name: "Hôtel Movenpick, Sousse", ...LOC.sousse }, city: "Sousse", country: "TUN",
    cat: "dermatology", imageUrl: IMG.derma, price: "180",
  },
  // ═══════════ 2026 ═══════════
  {
    title: "13ème Journée Pharmaceutique du CROPT 2026",
    description: "Journée scientifique du Conseil Régional de l'Ordre des Pharmaciens de Tunis (CROPT). Mises à jour réglementaires, pharmacovigilance, nouvelles molécules et pratique officinale moderne.",
    startDateTime: new Date("2026-01-16T08:00:00"), endDateTime: new Date("2026-01-17T18:00:00"),
    location: { name: "Radisson Blu, Tunis", ...LOC.tunis }, city: "Tunis", country: "TUN",
    cat: "generalMedicine", imageUrl: IMG.pharma, price: "80",
  },
  {
    title: "11ème Congrès de l'ATOC 2026 – Oto-Rhino-Laryngologie",
    description: "Congrès annuel de l'Association Tunisienne d'ORL et de Chirurgie Cervico-faciale (ATOC). Innovations chirurgicales, implants cochléaires, rhinologie endoscopique et oncologie ORL.",
    startDateTime: new Date("2026-01-23T08:00:00"), endDateTime: new Date("2026-01-24T18:00:00"),
    location: { name: "Hôtel Movenpick, Sousse", ...LOC.sousse }, city: "Sousse", country: "TUN",
    cat: "otolaryngology", imageUrl: IMG.atoc, price: "150",
  },
  {
    title: "21èmes Journées Pharmaceutiques Tunisiennes – SSPT 2026",
    description: "Grand rendez-vous annuel de la pharmacie tunisienne organisé par la Société des Sciences Pharmaceutiques de Tunisie (SSPT). Recherche pharmaceutique, pharmacologie clinique et développement du médicament.",
    startDateTime: new Date("2026-01-30T08:00:00"), endDateTime: new Date("2026-01-31T18:00:00"),
    location: { name: "Iberostar Kuriat Palace, Monastir", ...LOC.monastir }, city: "Monastir", country: "TUN",
    cat: "generalMedicine", imageUrl: IMG.sspt, price: "120",
  },
  {
    title: "4th Interdisciplinary World Health Conference – IWH 2026",
    description: "Conférence internationale interdisciplinaire sur la santé globale organisée par la Faculté de Médecine Ibn Al-Jazzar de Sousse. Santé publique, médecine communautaire et déterminants sociaux de la santé.",
    startDateTime: new Date("2026-04-13T08:00:00"), endDateTime: new Date("2026-04-17T18:00:00"),
    location: { name: "Faculté de Médecine Ibn Al-Jazzar, Sousse", ...LOC.sousse }, city: "Sousse", country: "TUN",
    cat: "preventiveMedicine", imageUrl: IMG.iwh, price: "100",
  },
  {
    title: "25ème Congrès National de Médecine d'Urgence – STMU 2026",
    description: "Congrès de référence en médecine d'urgence organisé par la Société Tunisienne de Médecine d'Urgence (STMU). SIM CUP, SONO CUP, PARAMED RUN, ateliers de simulation et urgentologie préhospitalière et hospitalière.",
    startDateTime: new Date("2026-04-16T08:00:00"), endDateTime: new Date("2026-04-18T18:00:00"),
    location: { name: "Hôtel The Russelior, Hammamet Yasmine", ...LOC.hammamet }, city: "Hammamet", country: "TUN",
    cat: "emergencyMedicine", imageUrl: IMG.emergency, price: "200",
  },
  {
    title: "CNG-2026 – Congrès National de Gériatrie (STG)",
    description: "Congrès annuel de la Société Tunisienne de Gériatrie. Polypathologie du sujet âgé, prévention des chutes, démences, fragilité et prise en charge gériatrique globale. Ateliers accrédités.",
    startDateTime: new Date("2026-04-20T08:00:00"), endDateTime: new Date("2026-04-22T18:00:00"),
    location: { name: "Hôtel Russelior, Hammamet Yasmine", ...LOC.hammamet }, city: "Hammamet", country: "TUN",
    cat: "geriatricMedicine", imageUrl: IMG.geriatric, price: "260",
  },
  {
    title: "35ème Congrès National de la STPI – Infectiologie 2026",
    description: "Congrès annuel de la Société Tunisienne de Pathologie Infectieuse (STPI). Résistances aux antibiotiques, infections nosocomiales, fièvres tropicales et nouvelles molécules anti-infectieuses.",
    startDateTime: new Date("2026-05-07T08:00:00"), endDateTime: new Date("2026-05-08T18:00:00"),
    location: { name: "Hôtel Russelior, Hammamet", ...LOC.hammamet }, city: "Hammamet", country: "TUN",
    cat: "infectiousDiseases", imageUrl: IMG.infect, price: "150",
  },
  {
    title: "36ème Congrès National de Pédiatrie & 42ème Congrès Maghrébin de Pédiatrie",
    description: "Le plus grand événement pédiatrique du Maghreb réunissant pédiatres tunisiens, algériens, marocains et libyens. Néonatologie, maladies rares de l'enfant, urgences pédiatriques et chirurgie pédiatrique.",
    startDateTime: new Date("2026-05-08T08:00:00"), endDateTime: new Date("2026-05-10T18:00:00"),
    location: { name: "Hôtel Sentido Marilia, Hammamet", ...LOC.hammamet }, city: "Hammamet", country: "TUN",
    cat: "pediatricMedicine", imageUrl: IMG.pedMag, price: "220",
  },
  {
    title: "XXIIIème Journée de Neurologie du Centre – JNC 2026",
    description: "Journée scientifique annuelle de neurologie clinique organisée par la Société Tunisienne de Neurologie. Actualités thérapeutiques en SEP, épilepsie, AVC et maladies neurodégénératives.",
    startDateTime: new Date("2026-05-22T08:00:00"), endDateTime: new Date("2026-05-23T18:00:00"),
    location: { name: "Hôtel Kantaoui Bey, Sousse", ...LOC.sousse }, city: "Sousse", country: "TUN",
    cat: "neurology", imageUrl: IMG.jnc2026, price: "120",
  },
  {
    title: "6èmes Rencontres Franco-Tunisiennes de Pneumologie & 8ème Congrès ATUFORCAL 2026",
    description: "Rencontres internationales franco-tunisiennes en pneumologie organisées conjointement par l'AFTNP et l'ATUFORCAL à Djerba. Pneumologie interventionnelle, BPCO, asthme sévère et oncologie thoracique.",
    startDateTime: new Date("2026-06-11T08:00:00"), endDateTime: new Date("2026-06-14T18:00:00"),
    location: { name: "Hôtel Hasdrubal Prestige, Djerba", ...LOC.djerba }, city: "Djerba", country: "TUN",
    cat: "pulmonology", imageUrl: IMG.pulmo, price: "280",
  },
  {
    title: "11ᵉ Journées de Pédiatrie Pratique de Sfax – JPP Sfax 2026",
    description: "Journées régionales de pédiatrie pratique à Sfax. Sessions interactives, cas cliniques filmés et formation médicale continue en pédiatrie de proximité et urgences pédiatriques.",
    startDateTime: new Date("2026-10-02T08:00:00"), endDateTime: new Date("2026-10-04T18:00:00"),
    location: { name: "Hôtel Concorde Sfax Center, Sfax", ...LOC.sfax }, city: "Sfax", country: "TUN",
    cat: "pediatricMedicine", imageUrl: IMG.pedSfax, price: "130",
  },
  {
    title: "46ème Congrès National STCCCV Joint au Congrès de Cardiologie du Maghreb 2026",
    description: "Congrès magistral réunissant les cardiologues de tout le Maghreb. Organisé par la STCCCV en partenariat avec les sociétés de cardiologie maghrébines. Electrophysiologie, insuffisance cardiaque, imagerie cardiaque et cardiopathies congénitales.",
    startDateTime: new Date("2026-11-12T08:00:00"), endDateTime: new Date("2026-11-14T18:00:00"),
    location: { name: "Centre de Congrès Radisson, Tunis", ...LOC.tunis }, city: "Tunis", country: "TUN",
    cat: "cardiology", imageUrl: IMG.cardio, price: "350",
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, { dbName: "badjitn", bufferCommands: false });
  console.log("✅  Connected\n");

  // 1. Admin user
  const admin = await User.findOne({ role: "admin" }).lean();
  if (!admin) {
    console.error("❌  No admin user found. Make sure at least one user has role='admin'.");
    process.exit(1);
  }
  console.log(`👤  Admin: ${admin.email} (${admin._id})`);

  // 2. Find or create verified organisation
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

  // 3. Ensure categories exist
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

  // 4. Create events (skip duplicates)
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
    });
    console.log(`  ✔  ${ev.title.slice(0, 70)}…`);
    created++;
  }

  console.log(`\n🎉  Terminé — ${created} événement(s) créé(s), ${skipped} ignoré(s) (doublon).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("💥  Erreur :", err.message || err);
  process.exit(1);
});
