import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClauseLens — Private Legal Research Desk",
  description:
    "An editorial legal research desk to understand complex contract clauses, evaluate differences, and prepare structured questions for legal counsel in clear, plain language.",
  keywords: [
    "legal research desk",
    "contract analysis",
    "clause comprehension",
    "legal memorandum",
    "plain language law",
    "counsel preparation",
  ],
  openGraph: {
    title: "ClauseLens — Private Legal Research Desk",
    description: "An editorial legal research desk for contract clause analysis and structured counsel preparation.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
