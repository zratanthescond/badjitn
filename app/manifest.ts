import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Badgi.net | Event Management & Discovery Platform",
    short_name: "Badgi.net",
    description:
      "All-in-one platform for event management, ticketing, badge generation, live check-ins, and event discovery.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    categories: ["events", "business", "productivity", "social", "lifestyle"],
  };
}
