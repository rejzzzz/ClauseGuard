import type { Metadata } from "next";
import {
  Inter,
  Plus_Jakarta_Sans,
  DM_Sans,
  Outfit,
  Manrope,
  Lora,
  Source_Serif_4,
  Playfair_Display,
  JetBrains_Mono,
  Space_Mono,
} from "next/font/google";
import AppShell from "@/components/AppShell";
import { FontProvider } from "@/lib/FontContext";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const plusJakartaSans = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta-sans", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });
const sourceSerif4 = Source_Serif_4({ variable: "--font-source-serif-4", subsets: ["latin"] });
const playfairDisplay = Playfair_Display({ variable: "--font-playfair-display", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });
const spaceMono = Space_Mono({ weight: ["400", "700"], variable: "--font-space-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClauseGuard — Autonomous Multi-Agent Contract Auditing",
  description: "Institutional multi-agent contract auditing, playbook citation grounding, and native OOXML tracked-changes redlining.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${dmSans.variable} ${outfit.variable} ${manrope.variable} ${lora.variable} ${sourceSerif4.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-slate-50 text-slate-900 font-sans">
        <FontProvider>
          <AppShell>{children}</AppShell>
        </FontProvider>
      </body>
    </html>
  );
}
