import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "BugShop — Тренировочный полигон для QA-инженеров",
  description: "Интернет-магазин со спрятанными багами для тренировки QA-инженеров. Найдите все ошибки!",
  keywords: ["QA", "Testing", "Bug Hunting", "Training", "Shop"],
  authors: [{ name: "QA Training Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
