import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || 'piktag';
const titles: Record<string, string> = {
  piktag: 'Piktag 任務中心',
  dayinup: 'DayinUP 樞紐中心',
  deoteng: 'Deoteng 皇家指令',
  gathertaiwan: 'GatherTaiwan 社區脈動'
};

export const metadata: Metadata = {
  title: titles[PROJECT_ID] || 'Imperial Dashboard',
  description: "Unified Dashboard for Imperial Feature Tracking and Collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
