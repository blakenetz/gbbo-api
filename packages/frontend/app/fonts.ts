import { Fraunces, Nunito } from "next/font/google";

// Fraunces' SOFT and WONK axes give headings their rounded, slightly wonky character.
export const displayFont = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
