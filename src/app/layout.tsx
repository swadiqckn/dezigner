import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GOOGLE_FONTS_URL } from "@/constants/fonts";
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
  title: "Poster Designer Studio - Modern Graphic Editor",
  description: "Professional browser-based poster maker and graphic designer studio with ERP layer injection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
      </head>
      <body className="min-h-full bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}

