/**
 * Update seeded medical events with their official participation URLs.
 * Run: node scripts/update-event-urls.mjs
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
if (!MONGODB_URI) { console.error("❌  MONGODB_URI missing"); process.exit(1); }

const EventSchema = new mongoose.Schema({ title: String, url: String });
const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

// Official participation URLs per event title
const URL_MAP = [
  {
    title: "AFRAN 2025 – 18ème Congrès de l'Association Africaine de Néphrologie",
    url: "https://www.medflixs.com/fr/conferences/congres-medical-tunisie/7",
  },
  {
    title: "34ème Congrès National STPI & 1er Congrès MENA de Microbiologie Clinique",
    url: "https://www.infectiologie.org.tn/congrestpi.php",
  },
  {
    title: "11ème Congrès A3P Tunisie – Anesthésie, Analgésie & Périopératoire",
    url: "https://congres.stageprod.net/events/11eme-congres-a3p-tunisie/",
  },
  {
    title: "XXIIème Journée de Neurologie du Centre – JNC 2025",
    url: "https://congres.stageprod.net/events/xxiieme-journee-de-neurologie-du-centre/",
  },
  {
    title: "Congrès National STAAR 2025 – Anesthésie & Réanimation",
    url: "https://www.staartunisia.org",
  },
  {
    title: "8ème Congrès de Médecine du Sommeil – STMS 2025",
    url: "https://stmra.org/index.php/cnp",
  },
  {
    title: "8ème Congrès National de Médecine Générale et de Médecine de Famille – CNMGF 2025",
    url: "https://www.medflixs.com/fr/conferences/congres-medical-tunisie/7",
  },
  {
    title: "12ème Congrès du Collège Tunisien de Gynécologie Obstétrique – CTGO 2025",
    url: "https://congres.stageprod.net/events/12eme-congres-du-college-tunisien-de-gynecologie-obstetrique/",
  },
  {
    title: "3èmes Rencontres de Pédiatrie Pratique du Cap Bon – APPC 2025",
    url: "https://congres.stageprod.net/events/3emes-rencontres-de-pediatrie-pratique-du-cap-bon/",
  },
  {
    title: "45ème Congrès National de la STCCCV – Cardiologie & Chirurgie Cardiovasculaire",
    url: "https://www.stcccv.org.tn/CongresNationaux",
  },
  {
    title: "29ème Congrès National de Pneumologie – STMRA 2025",
    url: "https://stmra.org/index.php/cnp",
  },
  {
    title: "Congrès National ATR 2025 – Association Tunisienne de Réanimation",
    url: "https://www.aturea.org/congreatr.php",
  },
  {
    title: "3ème Congrès DAR Francophone & Journée d'Hiver STEDIAM 2025 – Dermatologie",
    url: "https://congres.stageprod.net/events/3eme-congres-dar-francophone-journee-dhiver-de-la-stediam-2025/",
  },
  {
    title: "13ème Journée Pharmaceutique du CROPT 2026",
    url: "https://congres.stageprod.net/events/13eme-journee-pharmaceutique-cropt/",
  },
  {
    title: "11ème Congrès de l'ATOC 2026 – Oto-Rhino-Laryngologie",
    url: "https://congres.stageprod.net/events/11eme-congres-de-latoc/",
  },
  {
    title: "21èmes Journées Pharmaceutiques Tunisiennes – SSPT 2026",
    url: "https://congres.stageprod.net/events/21e-journees-pharmaceutiques-tunisiennes-sspt/",
  },
  {
    title: "4th Interdisciplinary World Health Conference – IWH 2026",
    url: "https://congres.stageprod.net/events/4th-interdisciplinary-world-health/",
  },
  {
    title: "25ème Congrès National de Médecine d'Urgence – STMU 2026",
    url: "https://stmu.tn/index.php/evenements/25eme-congres-national-de-medecine-durgence-2",
  },
  {
    title: "CNG-2026 – Congrès National de Gériatrie (STG)",
    url: "https://stg-congresgeriatrie.com/inscription-au-congres",
  },
  {
    title: "35ème Congrès National de la STPI – Infectiologie 2026",
    url: "https://www.infectiologie.org.tn/congrestpi.php",
  },
  {
    title: "36ème Congrès National de Pédiatrie & 42ème Congrès Maghrébin de Pédiatrie",
    url: "https://congres.stageprod.net/events/36eme-congres-national-de-pediatrie-42eme-congres-maghrebin-de-pediatrie/",
  },
  {
    title: "XXIIIème Journée de Neurologie du Centre – JNC 2026",
    url: "https://congres.stageprod.net/events/xxiii%E1%B5%89-journee-de-neurologie-du-centre/",
  },
  {
    title: "6èmes Rencontres Franco-Tunisiennes de Pneumologie & 8ème Congrès ATUFORCAL 2026",
    url: "https://www.aftnp.org/",
  },
  {
    title: "11ᵉ Journées de Pédiatrie Pratique de Sfax – JPP Sfax 2026",
    url: "https://congres.stageprod.net/events/11%E1%B5%89-journees-de-pediatrie-pratique-de-sfax/",
  },
  {
    title: "46ème Congrès National STCCCV Joint au Congrès de Cardiologie du Maghreb 2026",
    url: "https://www.stcccv.org.tn/Home/evenement/159/detail",
  },
];

async function main() {
  console.log("🔌  Connecting…");
  await mongoose.connect(MONGODB_URI, { dbName: "badjitn", bufferCommands: false });
  console.log("✅  Connected\n");

  let updated = 0;
  for (const { title, url } of URL_MAP) {
    const res = await Event.updateOne({ title }, { $set: { url } });
    if (res.modifiedCount > 0) {
      console.log(`  ✔  ${title.slice(0, 65)}…`);
      updated++;
    } else {
      console.log(`  ⚠  Not found: ${title.slice(0, 65)}…`);
    }
  }

  console.log(`\n🎉  ${updated} événement(s) mis à jour avec leur URL officielle.`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error("💥", err.message); process.exit(1); });
