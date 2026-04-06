export const headerLinks = [
  {
    label: "home",
    route: "/",
  },
  {
    label: "createEvent",
    route: "/events/create",
  },
  {
    label: "myProfile",
    route: "/profile",
  },
  {
    label: "aiTools",
    route: "/ai-tools",
  },
];

export const eventDefaultValues = {
  title: "",
  description: "",
  location: {
    name: "",
    lon: 33,
    lat: 33,
  },
  imageUrl: "",
  startDateTime: new Date(),
  endDateTime: new Date(),
  categoryId: "",
  price: "",
  isFree: false,
  isOnline: false,
  url: null as string | null,
  sponsors: [] as string[],
  requiredInfo: [] as string[],
  country: "TUN",
  discount: null as { field: string; value: string; discount: number } | null,
  organisationId: "",
  places: 0,
  scanPoints: [] as string[],
  showWorkSubmissionPopup: false,
  allowGuestRegistration: true,
  disabledBaseFields: [] as string[],
  city: "",
  village: "",
  jobTitleLabel: "",
  selectedRepublic: "",
  customRegistrationFields: [],
  showProfileButton: true,
  showReturnButton: true,
};
export const borderColors = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // green
  "#facc15", // yellow
  "#a855f7", // purple
  "#ec4899", // pink
];

export const CATEGORY_KEYS = [
  "all",
  "forYou",
  "pulmonology",
  "cardiology",
  "dermatology",
  "gastroenterology",
  "neurosurgery",
  "surgery",
  "orthopedics",
  "psychiatry",
  "internalMedicine",
  "generalMedicine",
  "sportsMedicine",
  "aestheticMedicine",
  "emergencyMedicine",
  "pediatricMedicine",
  "geriatricMedicine",
  "preventiveMedicine",
  "occupationalMedicine",
  "familyMedicine",
  "surgicalMedicine",
  "reproductiveMedicine",
  "neurology",
  "oncology",
  "radiology",
  "urology",
  "endocrinology",
  "rheumatology",
  "nephrology",
  "ophthalmology",
  "otolaryngology",
  "allergology",
  "anesthesiology",
  "pathology",
  "genetics",
  "infectiousDiseases",
  "nuclearMedicine",
  "hematology",
  "painManagement",
];
