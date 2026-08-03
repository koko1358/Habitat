import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habitap",
    short_name: "Habitap",
    description: "A simple, personal habit tracker for quick daily use.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fdfbf8",
    theme_color: "#c9793f",
    orientation: "portrait",
    icons: [
      {
        src: "/manifest-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/manifest-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/manifest-icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
