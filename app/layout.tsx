import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  Archivo_Black,
  Bricolage_Grotesque,
  Chakra_Petch,
  Cormorant_Garamond,
  DM_Serif_Display,
  Inter,
  Space_Grotesk,
  Space_Mono,
} from "next/font/google";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

// Use only essential fonts in layout to reduce the initial font payload.
// Additional custom fonts remain in CSS variables as fallbacks if needed.

// const accentFont = Space_Grotesk({
//   subsets: ["latin"],
//   variable: "--font-accent",
//   display: "swap",
// });

// const expressiveFont = Bricolage_Grotesque({
//   subsets: ["latin"],
//   variable: "--font-expressive-base",
//   display: "swap",
// });

// const graphicFont = Archivo_Black({
//   subsets: ["latin"],
//   variable: "--font-graphic-base",
//   weight: "400",
//   display: "swap",
// });

// const monoAltFont = Space_Mono({
//   subsets: ["latin"],
//   variable: "--font-mono-base",
//   weight: ["400", "700"],
//   display: "swap",
// });

// const editorialAltFont = Cormorant_Garamond({
//   subsets: ["latin"],
//   variable: "--font-editorial-base",
//   weight: ["400", "500", "600", "700"],
//   display: "swap",
// });

// const techFont = Chakra_Petch({
//   subsets: ["latin"],
//   variable: "--font-tech-base",
//   weight: ["400", "500", "600", "700"],
//   display: "swap",
// });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Bisnis.me Builder",
  description: "Multi business landing page builder with dynamic slug pages and admin management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
