import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PlantShell } from "@/components/plant-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CNH plant desk",
  description:
    "Fargo combine final and Racine dealer-prep fault desk — tags, ranked modes, work orders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PlantShell>{children}</PlantShell>
      </body>
    </html>
  );
}
