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
  url: "",
};
export const borderColors = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // green
  "#facc15", // yellow
  "#a855f7", // purple
  "#ec4899", // pink
];
