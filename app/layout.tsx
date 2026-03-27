import type { Metadata } from "next";
import { DM_Serif_Display, Inter, Space_Grotesk } from "next/font/google";
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

const accentFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-accent",
  display: "swap",
});

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
      <body className={`${bodyFont.variable} ${displayFont.variable} ${accentFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
