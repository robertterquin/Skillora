import type { MetadataRoute } from "next";

/** Lets people install Skillora to their home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Skillora",
    short_name: "Skillora",
    description: "Short, ordered practice steps for practical skills.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#F7F5F0",
    theme_color: "#F7F5F0",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
