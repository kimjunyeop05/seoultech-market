// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 추가
import AuthCallback from "@/components/AuthCallback";

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
    <header className="p-4 border-b flex gap-4">
      <Link href="/">SeoulTech Market</Link>
      <nav className="flex gap-4 ml-4">
        <Link href="/auth">로그인</Link>
        <Link href="/auth/logout">로그아웃</Link>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/*  해시/코드 콜백 전역 처리 */}
        <AuthCallback />

        <Header />
        {children}
      </body>
    </html>
  );
}
