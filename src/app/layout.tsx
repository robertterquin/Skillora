import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { RouteProgressBar } from "@/components/ui/RouteProgressBar";
import { Providers } from "@/components/ui/Providers";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap";

export const metadata: Metadata = {
  title: "Skillora — Master Any Skill, Large or Small",
  description:
    "An intentional learning engine breaking down music, languages, tactile crafts, and micro-skills into structured steps, curated sites, and clear time commitments.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "Skillora", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#151413" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_URL} />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-ink focus:text-white focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <Providers>
          <RouteProgressBar />
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
