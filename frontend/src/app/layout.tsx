import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairSerif = Playfair_Display({
  variable: "--font-playfair-serif",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} ${playfairSerif.variable} h-full antialiased`}
    >
      <body className="h-full bg-slate-50 text-slate-900 font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
