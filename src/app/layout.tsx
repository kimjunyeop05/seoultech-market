// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AuthCallback from "@/components/AuthCallback";   // 로그인 콜백(해시+코드)
import NavAuth from "@/components/NavAuth";             // 로그인/로그아웃 UI

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SeoulTech Market",
  description: "Campus marketplace",
};

function Header() {
  return (
    <header className="p-4 border-b flex justify-between items-center">
      <Link href="/">SeoulTech Market</Link>
      {/* 로그인 상태 표시/제어 */}
      <NavAuth />
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 로그인 콜백 전역 처리 */}
        <AuthCallback />
        <Header />
        {children}
      </body>
    </html>
  );
}
