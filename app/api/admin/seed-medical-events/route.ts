import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import User from "@/lib/database/models/user.model";
import Category from "@/lib/database/models/category.model";
import Organisation from "@/lib/database/models/organisation.model";

const SEED_SECRET = "BADGI_SEED_MEDICAL_2026";

const LOCATIONS = {
  tunis:    { lon: 10.1815, lat: 36.8065 },
  hammamet: { lon: 10.5613, lat: 36.3996 },
  sousse:   { lon: 10.6369, lat: 35.8249 },
  monastir: { lon: 10.8113, lat: 35.7643 },
  sfax:     { lon: 10.7600, lat: 34.7398 },
  djerba:   { lon: 10.8451, lat: 33.8075 },
  korba:    { lon: 10.8550, lat: 36.5775 },
  bizerte:  { lon: 9.8642,  lat: 37.2746 },
  kasserine: { lon: 8.8365, lat: 35.1721 },
};

// Reliable public images (event posters from congres.stageprod.net + Unsplash medical photos)
const IMAGES = {
  // Actual event poster thumbnails from congres.stageprod.net
  a3p:        "https://congres.stageprod.net/wp-content/uploads/2025/08/11eme-CongresA3P-1-300x300.jpg",
  jnc2025:    "https://congres.stageprod.net/wp-content/uploads/2025/09/affiche-jnc2025-300x300.png",
  gyneco:     "https://congres.stageprod.net/wp-content/uploads/2025/08/Deadline-05-oct-2025-300x300.jpg",
  pedcapbon:  "https://congres.stageprod.net/wp-content/uploads/2025/08/APPC-3-300x300.png",
  dermaDAR:   "https://congres.stageprod.net/wp-content/uploads/2025/08/save-the-date-dar-phro-300x300.png",
  atoc:       "https://congres.stageprod.net/wp-content/uploads/2025/11/Affiche-ATOC-2026-300x300.jpg",
  sspt:       "https://congres.stageprod.net/wp-content/uploads/2026/01/SSPT-PROGRAMME--300x300.jpg",
  iwh:        "https://congres.stageprod.net/wp-content/uploads/2025/12/aff4IWH-300x300.png",
  pedMaghreb: "https://congres.stageprod.net/wp-content/uploads/2025/12/societe.tunisienne.pediatrie@gmail.com_-1448x2048-1-300x300.webp",
  jnc2026:    "https://congres.stageprod.net/wp-content/uploads/2026/04/Affiche-JNC-2026-Affiche-portrait-A3Affiche-JNC26-1-300x300.png",
  pedSfax:    "https://congres.stageprod.net/wp-content/uploads/2026/04/Capture-decran-2026-04-23-a-9.51.26%20AM-205x300.png",
  // Generic medical Unsplash images (stable CDN)
  cardio:     "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
  pulmo:      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
  emergency:  "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80",
  infect:     "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80",
  general:    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  anestho:    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80",
  pediatrics: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80",
  geriatrics: "https://images.unsplash.com/photo-1556821840-3a63f15732d2?w=800&q=80",
  nephro:     "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  pharma:     "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  neurology:  "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
  repro:      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80",
};

const medicalEvents = [
  // ──── 2025 ────
  {
    title: "AFRAN 2025 – 18ème Congrès de l'Association Africaine de Néphrologie",
    description:
      "Le 18ème Congrès de l'Association Africaine de Néphrologie (AFRAN) réunit des néphrologues de toute l'Afrique et de la diaspora pour partager les dernières avancées en médecine rénale, dialyse et transplantation.",
    startDateTime: new Date("2025-04-15T08:00:00"),
    endDateTime:   new Date("2025-04-17T18:00:00"),
    location: { name: "Hôtel El Mouradi, Tunis", ...LOCATIONS.tunis },
    city: "Tunis", country: "TUN",
    categoryKey: "nephrology",
    imageUrl: IMAGES.nephro,
    isFree: false, price: "200",
  },
  {
    title: "34ème Congrès National STPI & 1er Congrès MENA de Microbiologie Clinique",
    description:
      "Premier congrès MENA conjoint de microbiologie clinique et pathologie infectieuse organisé par la Société Tunisienne de Pathologie Infectieuse (STPI). Experts de 20 pays discutent des dernières stratégies diagnostiques et thérapeutiques face aux pathogènes émergents.",
    startDateTime: new Date("2025-05-22T08:00:00"),
    endDateTime:   new Date("2025-05-24T18:00:00"),
    location: { name: "Hôtel Russelior, Hammamet Yasmine", ...LOCATIONS.hammamet },
    city: "Hammamet", country: "TUN",
    categoryKey: "infectiousDiseases",
    imageUrl: IMAGES.infect,
    isFree: false, price: "150",
  },
  {
    title: "11ème Congrès A3P Tunisie – Anesthésie, Analgésie & Périopératoire",
    description:
      "Le congrès annuel de l'Association des Anesthésistes-réanimateurs du Privé et du Public de Tunisie (A3P). Ateliers pratiques, sessions scientifiques et formations continues en anesthésie-réanimation.",
    startDateTime: new Date("2025-09-11T08:00:00"),
    endDateTime:   new Date("2025-09-12T18:00:00"),
    location: { name: "Hôtel Hasdrubal, Hammamet", ...LOCATIONS.hammamet },
    city: "Hammamet", country: "TUN",
    categoryKey: "anesthesiology",
    imageUrl: IMAGES.a3p,
    isFree: false, price: "180",
  },
  {
    title: "XXIIème Journée de Neurologie du Centre – JNC 2025",
    description:
      "Journée scientifique organisée par la Société Tunisienne de Neurologie pour les neurologues de la région Centre. Programme riche en cas cliniques, mises au point et nouvelles thérapeutiques neurologiques.",
    startDateTime: new Date("2025-09-20T08:00:00"),
    endDateTime:   new Date("2025-09-20T18:00:00"),
    location: { name: "Hôtel Movenpick, Sousse", ...LOCATIONS.sousse },
    city: "Sousse", country: "TUN",
    categoryKey: "neurology",
    imageUrl: IMAGES.jnc2025,
    isFree: false, price: "100",
  },
  {
    title: "Congrès National STAAR 2025 – Société Tunisienne d'Anesthésie et de Réanimation",
    description:
      "Congrès annuel de la STAAR dédié aux avancées en anesthésie, réanimation et médecine intensive. Simulation médicale haute-fidélité, ateliers pratiques et conférences de haut niveau.",
    startDateTime: new Date("2025-10-02T08:00:00"),
    endDateTime:   new Date("2025-10-04T18:00:00"),
    location: { name: "Hôtel The Russelior, Hammamet", ...LOCATIONS.hammamet },
    city: "Hammamet", country: "TUN",
    categoryKey: "anesthesiology",
    imageUrl: IMAGES.anestho,
    isFree: false, price: "200",
  },
  {
    title: "8ème Congrès de Médecine du Sommeil – STMS 2025",
    description:
      "La Société Tunisienne de Médecine du Sommeil organise son 8ème congrès national. Thèmes : troubles respiratoires du sommeil, insomnie, somnolence et neurosciences du sommeil. Ateliers de polysomnographie.",
    startDateTime: new Date("2025-10-09T08:00:00"),
    endDateTime:   new Date("2025-10-11T18:00:00"),
    location: { name: "Hôtel The Russelior Royal, Hammamet", ...LOCATIONS.hammamet },
    city: "Hammamet", country: "TUN",
    categoryKey: "neurology",
    imageUrl: IMAGES.neurology,
    isFree: false, price: "160",
  },
  {
    title: "8ème Congrès National de Médecine Générale et de Médecine de Famille – CNMGF 2025",
    description:
      "Le grand rendez-vous annuel de la médecine de première ligne en Tunisie. Organisé par la Société Tunisienne de Médecine Générale et de Médecine de Famille (STMGF), il réunit praticiens et spécialistes autour de la prise en charge holistique du patient.",
    startDateTime: new Date("2025-10-23T08:00:00"),
    endDateTime:   new Date("2025-10-25T18:00:00"),
    location: { name: "El Médina Yasmine Hammamet Convention Centre", ...LOCATIONS.hammamet },
    city: "Hammamet", country: "TUN",
    categoryKey: "generalMedicine",
    imageUrl: IMAGES.general,
    isFree: false, price: "150",
  },
  {
    title: "12ème Congrès du Collège Tunisien de Gynécologie Obstétrique – CTGO 2025",
    description:
      "Congrès dédié à la gynécologie, l'obstétrique et la médecine reproductive. Au programme : procréation médicalement assistée, oncologie gynécologique, chirurgie laparoscopique et suivi de grossesse à risque.",
    startDateTime: new Date("2025-10-24T08:00:00"),
    endDateTime:   new Date("2025-10-25T18:00:00"),
    location: { name: "Hôtel Sousse Palace, Sousse", ...LOCATIONS.sousse },
    city: "Sousse", country: "TUN",
    categoryKey: "reproductiveMedicine",
    imageUrl: IMAGES.gyneco,
    isFree: false, price: "180",
  },
  {
    title: "3èmes Rencontres de Pédiatrie Pratique du Cap Bon – APPC 2025",
    description:
      "Journées régionales de pédiatrie pratique organisées par l'Association de Pédiatrie Pratique du Cap Bon. Cas cliniques, ateliers et mises à jour thérapeutiques pour pédiatres et médecins généralistes.",
    startDateTime: new Date("2025-11-15T08:00:00"),
    endDateTime:   new Date("2025-11-16T18:00:00"),
    location: { name: "Africa Jade Thalasso Hôtel, Korba", ...LOCATIONS.korba },
    city: "Korba", country: "TUN",
    categoryKey: "pediatricMedicine",
    imageUrl: IMAGES.pedcapbon,
    isFree: false, price: "100",
  },
  {
    title: "45ème Congrès National de la STCCCV – Cardiologie & Chirurgie Cardiovasculaire",
    description:
      "Le plus grand congrès de cardiologie en Tunisie organisé par la Société Tunisienne de Cardiologie et de Chirurgie Cardiovasculaire (STCCCV). Innovation en cardiologie interventionnelle, électrophysiologie, échocardiographie et chirurgie cardiaque.",
    startDateTime: new Date("2025-11-20T08:00:00"),
    endDateTime:   new Date("2025-11-22T18:00:00"),
    location: { name: "Radisson Congress Centre, Tunis", ...LOCATIONS.tunis },
    city: "Tunis", country: "TUN",
    categoryKey: "cardiology",
    imageUrl: IMAGES.cardio,
    isFree: false, price: "300",
  },
  {
    title: "29ème Congrès National de Pneumologie – STMRA 2025",
    description:
      "Le congrès annuel de la Société Tunisienne des Maladies Respiratoires et d'Allergologie (STMRA). Thèmes : asthme, BPCO, cancer bronchique, pneumopathies interstitielles, apnée du sommeil et allergologie respiratoire.",
    startDateTime: new Date("2025-11-27T08:00:00"),
    endDateTime:   new Date("2025-11-29T18:00:00"),
    location: { name: "Hôtel Movënpick-Lac 1, Tunis", ...LOCATIONS.tunis },
    city: "Tunis", country: "TUN",
    categoryKey: "pulmonology",
    imageUrl: IMAGES.pulmo,
    isFree: false, price: "250",
  },
  {
    title: "Congrès National ATR 2025 – Association Tunisienne de Réanimation",
    description:
      "Congrès scientifique de l'Association Tunisienne de Réanimation dédié à la médecine intensive et aux soins critiques. Simulations haute-fidélité, controverses thérapeutiques et présentation des derniers protocoles de réanimation.",
    startDateTime: new Date("2025-11-27T08:00:00"),
    endDateTime:   new Date("2025-11-29T18:00:00"),
    location: { name: "Hôtel The Russelior, Hammamet", ...LOCATIONS.hammamet },
    city: "Hammamet", country: "TUN",
    categoryKey: "internalMedicine",
    imageUrl: IMAGES.anestho,
    isFree: false, price: "200",
  },
  {
    title: "3ème Congrès DAR Francophone & Journée d'Hiver STEDIAM 2025 – Dermatologie",
    description:
      "Congrès bilingue franco-tunisien en dermatologie et allergologie respiratoire organisé par la Société Tunisienne d'Études en Dermatologie, Immunologie et Allergologie Médicale (STEDIAM). Dernières avancées en dermatologie clinique et esthétique.",
    startDateTime: new Date("2025-12-19T08:00:00"),
    endDateTime:   new Date("2025-12-20T18:00:00"),
    location: { name: "Hôtel Movenpick, Sousse", ...LOCATIONS.sousse },
    city: "Sousse", country: "TUN",
    categoryKey: "dermatology",
    imageUrl: IMAGES.dermaDAR,
    isFree: false, price: "180",
  },
  // ──── 2026 ────
  {
    title: "13ème Journée Pharmaceutique du CROPT 2026",
    description:
      "Journée scientifique annuelle organisée par le Conseil Régional de l'Ordre des Pharmaciens de Tunis (CROPT). Mises à jour réglementaires, pharmacovigilance, nouvelles molécules et pratique officinale.",
    startDateTime: new Date("2026-01-16T08:00:00"),
    endDateTime:   new Date("2026-01-17T18:00:00"),
    location: { name: "Radisson Blu, Tunis", ...LOCATIONS.tunis },
    city: "Tunis", country: "TUN",
    categoryKey: "generalMedicine",
    imageUrl: IMAGES.pharma,
    isFree: false, price: "80",
  },
  {
    title: "11ème Congrès de l'ATOC 2026 – Oto-Rhino-Laryngologie",
    description:
      "Congrès annuel de l'Association Tunisienne d'Oto-rhino-laryngologie et de Chirurgie Cervico-faciale (ATOC). Innovations chirurgicales, implants cochléaires, rhinologie endoscopique et oncologie ORL.",
    startDateTime: new Date("2026-01-23T08:00:00"),
    endDateTime:   new Date("2026-01-24T18:00:00"),
    location: { name: "Hôtel Movenpick, Sousse", ...LOCATIONS.sousse },
    city: "Sousse", country: "TUN",
    categoryKey: "otolaryngology",
    imageUrl: IMAGES.atoc,
    isFree: false, price: "150",
  },
  {
    title: "21èmes Journées Pharmaceutiques Tunisiennes – SSPT 2026",
    description:
      "Grand rendez-vous annuel de la pharmacie tunisienne organisé par la Société des Sciences Pharmaceutiques de Tunisie (SSPT). Recherche pharmaceutique, pharmacologie clinique et développement du médicament.",
    startDateTime: new Date("2026-01-30T08:00:00"),
    endDateTime:   new Date("2026-01-31T18:00:00"),
    location: { name: "Iberostar Kuriat Palace, Monastir", ...LOCATIONS.monastir },
    city: "Monastir", country: "TUN",
    categoryKey: "generalMedicine",
    imageUrl: IMAGES.sspt,
    isFree: false, price: "120",
  },
  {
    title: "4th Interdisciplinary World Health Conference – IWH 2026",
    description:
      "Conférence internationale interdisciplinaire sur la santé globale organisée par la Faculté de Médecine Ibn Al-Jazzar de Sousse. Santé publique, médecine communautaire et déterminants sociaux de la santé.",
    startDateTime: new Date("2026-04-13T08:00:00"),
    endDateTime:   new Date("2026-04-17T18:00:00"),
    location: { name: "Faculté de Médecine Ibn Al-Jazzar, Sousse", ...LOCATIONS.sousse },
    city: "Sousse", country: "TUN",
    categoryKey: "preventiveMedicine",
    imageUrl: IMAGES.iwh,
    isFree: false, price: "100",
  },
  {
    title: "25ème Congrès National de Médecine d'Urgence – STMU 2026",
    description:
      "Congrès de référence en médecine d'urgence organisé par la Société Tunisienne de Médecine d'Urgence (STMU). SIM CUP, SONO CUP, PARAMED RUN, ateliers de simulation et sessions scientifiques en urgentologie préhospitalière et hospitalière.",
    startDateTime: new Date("2026-04-16T08:00:00"),
    endDateTime:   new Date("2026-04-18T18:00:00"),
    location: { name: "Hôtel The Russelior, Hammamet Yasmine", ...LOCATIONS.hammamet },
    city: "Hammamet", country: "TUN",
    categoryKey: "emergencyMedicine",
    imageUrl: IMAGES.emergency,
    isFree: false, price: "200",
  },
  {
    title: "CNG-2026 – Congrès National de Gériatrie (STG)",
    description:
      "Congrès annuel de la Société Tunisienne de Gériatrie dédié à la médecine du vieillissement. Polypathologie du sujet âgé, chutes, démences, fragilité et prise en charge gériatrique globale. Ateliers accrédités.",
    startDateTime: new Date("2026-04-20T08:00:00"),
    endDateTime:   new Date("2026-04-22T18:00:00"),
    location: { name: "Hôtel Russelior, Hammamet Yasmine", ...LOCATIONS.hammamet },
    city: "Hammamet", country: "TUN",
    categoryKey: "geriatricMedicine",
    imageUrl: IMAGES.geriatrics,
    isFree: false, price: "260",
  },
  {
    title: "35ème Congrès National de la STPI – Maladies Infectieuses 2026",
    description:
      "Congrès annuel de la Société Tunisienne de Pathologie Infectieuse (STPI) à l'Hôtel Russelior de Hammamet. Résistances aux antibiotiques, infections nosocomiales, fièvres tropicales et nouvelles molécules anti-infectieuses.",
    startDateTime: new Date("2026-05-07T08:00:00"),
    endDateTime:   new Date("2026-05-08T18:00:00"),
    location: { name: "Hôtel Russelior, Hammamet", ...LOCATIONS.hammamet },
    city: "Hammamet", country: "TUN",
    categoryKey: "infectiousDiseases",
    imageUrl: IMAGES.infect,
    isFree: false, price: "150",
  },
  {
    title: "36ème Congrès National de Pédiatrie & 42ème Congrès Maghrébin de Pédiatrie",
    description:
      "Le plus grand événement pédiatrique du Maghreb réunissant pédiatres tunisiens, algériens, marocains et libyens. Néonatologie, pédiatrie générale, maladies rares de l'enfant, urgences pédiatriques et chirurgie pédiatrique.",
    startDateTime: new Date("2026-05-08T08:00:00"),
    endDateTime:   new Date("2026-05-10T18:00:00"),
    location: { name: "Hôtel Sentido Marilia, Hammamet", ...LOCATIONS.hammamet },
    city: "Hammamet", country: "TUN",
    categoryKey: "pediatricMedicine",
    imageUrl: IMAGES.pedMaghreb,
    isFree: false, price: "220",
  },
  {
    title: "XXIIIème Journée de Neurologie du Centre – JNC 2026",
    description:
      "Journée scientifique annuelle de neurologie clinique pour la région Centre organisée par la Société Tunisienne de Neurologie. Cas complexes, actualités thérapeutiques en SEP, épilepsie, AVC et maladies neurodégénératives.",
    startDateTime: new Date("2026-05-22T08:00:00"),
    endDateTime:   new Date("2026-05-23T18:00:00"),
    location: { name: "Hôtel Kantaoui Bey, Sousse", ...LOCATIONS.sousse },
    city: "Sousse", country: "TUN",
    categoryKey: "neurology",
    imageUrl: IMAGES.jnc2026,
    isFree: false, price: "120",
  },
  {
    title: "6èmes Rencontres Franco-Tunisiennes de Pneumologie & 8ème Congrès ATUFORCAL 2026",
    description:
      "Rencontres internationales franco-tunisiennes en pneumologie organisées conjointement par l'Association Franco-Tunisienne de Pneumologie (AFTNP) et l'ATUFORCAL. Pneumologie interventionnelle, BPCO, asthme sévère et oncologie thoracique.",
    startDateTime: new Date("2026-06-11T08:00:00"),
    endDateTime:   new Date("2026-06-14T18:00:00"),
    location: { name: "Hôtel Hasdrubal Prestige, Djerba", ...LOCATIONS.djerba },
    city: "Djerba", country: "TUN",
    categoryKey: "pulmonology",
    imageUrl: IMAGES.pulmo,
    isFree: false, price: "280",
  },
  {
    title: "11ᵉ Journées de Pédiatrie Pratique de Sfax – JPP Sfax 2026",
    description:
      "Journées régionales de pédiatrie pratique à Sfax organisées par la Société de Pédiatrie de Sfax. Sessions interactives, cas cliniques filmés et formation médicale continue en pédiatrie de proximité.",
    startDateTime: new Date("2026-10-02T08:00:00"),
    endDateTime:   new Date("2026-10-04T18:00:00"),
    location: { name: "Hôtel Concorde Sfax Center, Sfax", ...LOCATIONS.sfax },
    city: "Sfax", country: "TUN",
    categoryKey: "pediatricMedicine",
    imageUrl: IMAGES.pedSfax,
    isFree: false, price: "130",
  },
  {
    title: "46ème Congrès National STCCCV Joint au Congrès de Cardiologie du Maghreb 2026",
    description:
      "Congrès magistral de cardiologie réunissant les cardiologues de tout le Maghreb. Organisé conjointement par la STCCCV et les sociétés de cardiologie du Maghreb. Innovations en electrophysiologie, insuffisance cardiaque, imagerie cardiaque et cardiopathies congénitales.",
    startDateTime: new Date("2026-11-12T08:00:00"),
    endDateTime:   new Date("2026-11-14T18:00:00"),
    location: { name: "Centre de Congrès Radisson, Tunis", ...LOCATIONS.tunis },
    city: "Tunis", country: "TUN",
    categoryKey: "cardiology",
    imageUrl: IMAGES.cardio,
    isFree: false, price: "350",
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized – pass ?secret=..." }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // 1. Get admin user
    const adminUser = await User.findOne({ role: "admin" }).lean();
    if (!adminUser) {
      return NextResponse.json({ error: "No admin user found in DB" }, { status: 404 });
    }

    // 2. Find or create a verified organisation for Badgi editorial events
    const orgSlug = "badgi-agenda-medical-tunisie";
    let org = await Organisation.findOne({ slug: orgSlug });
    if (!org) {
      org = await Organisation.create({
        name: "Badgi Agenda Médical Tunisie",
        slug: orgSlug,
        description: "Agenda officiel des congrès et événements médicaux en Tunisie – Badgi.net",
        logo: "https://badgi.net/assets/images/logo.png",
        website: "https://badgi.net",
        creator: (adminUser as any)._id,
        admins: [(adminUser as any)._id],
        isVerified: true,
      });
    }

    // 3. Ensure all required categories exist
    const requiredCategoryKeys = [
      ...new Set(medicalEvents.map((e) => e.categoryKey)),
    ];
    const existingCategories = await Category.find({
      name: { $in: requiredCategoryKeys },
    }).lean();
    const existingKeys = existingCategories.map((c: any) => c.name);
    const missingKeys = requiredCategoryKeys.filter((k) => !existingKeys.includes(k));
    if (missingKeys.length > 0) {
      await Category.insertMany(missingKeys.map((name) => ({ name })));
    }
    const allCategories = await Category.find({
      name: { $in: requiredCategoryKeys },
    }).lean();
    const categoryMap: Record<string, any> = {};
    allCategories.forEach((c: any) => { categoryMap[c.name] = c._id; });

    // 4. Create events (skip duplicates by title)
    const existingTitles = (
      await Event.find({ organisation: org._id }, { title: 1 }).lean()
    ).map((e: any) => e.title);

    let created = 0;
    const skipped: string[] = [];

    for (const ev of medicalEvents) {
      if (existingTitles.includes(ev.title)) {
        skipped.push(ev.title);
        continue;
      }
      const { categoryKey, ...rest } = ev;
      await Event.create({
        ...rest,
        category: categoryMap[categoryKey],
        organizer: (adminUser as any)._id,
        organisation: org._id,
        isFree: false,
        allowGuestRegistration: true,
        restricted: false,
        showProfileButton: true,
        showReturnButton: true,
      });
      created++;
    }

    return NextResponse.json({
      success: true,
      created,
      skipped: skipped.length,
      organisation: org.name,
      admin: (adminUser as any).email,
    });
  } catch (err: any) {
    console.error("[seed-medical-events]", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
