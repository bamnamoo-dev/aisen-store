import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "아이센스토어 (AI-SEN STORE) | 스마트 교육행정 AI 포털",
  description: "공무원 스마트 여비정산기, 3-Tier AI-SEN RAG 챗봇, 102권 공식 지침서 및 실무 서식 아카이브 통합 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" as="style" crossOrigin="" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="antialiased bg-[#f8fafc] text-[#0f172a] selection:bg-blue-600 selection:text-white">
        <Sidebar />
        <main className="md:pl-64 min-h-screen pt-14 md:pt-0">
          {children}
        </main>
      </body>
    </html>
  );
}
