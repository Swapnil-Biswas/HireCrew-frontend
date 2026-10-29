import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollMotion from "@/components/ScrollMotion";
import PageIndicator from "@/components/PageIndicator";
import LiquidGlassFilter from "@/components/LiquidGlassFilter";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#046A38",
};

export const metadata: Metadata = {
  title: "HireCrew — Hire a crew, not just an agent",
  description:
    "A marketplace for agent jobs. Order in plain language, payment is held until the work is checked in your real apps. Pay only for finished work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // "js" turns on the hidden starting states for scroll reveals; ScrollMotion removes it if setup fails.
  return (
    <html lang="en" className={`${instrument.variable} js`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <LiquidGlassFilter />
        <Nav />
        <PageIndicator />
        <SmoothScroll>{children}</SmoothScroll>
        <ScrollMotion />
      </body>
    </html>
  );
}
