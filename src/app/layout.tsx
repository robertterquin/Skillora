import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui/Header";

export const metadata: Metadata = {
  title: "Skillora — Master Any Skill, Large or Small",
  description:
    "An intentional learning engine breaking down music, languages, tactile crafts, and micro-skills into structured steps, curated sites, and clear time commitments.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
