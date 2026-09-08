'use client';

import React from 'react';
import { BookOpen, Printer } from 'lucide-react';
import ToolHeader from '@/components/ToolHeader';
import ManualContent from '@/components/ManualContent';

export default function GuidePage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/60">
      {/* 상단 툴 헤더 */}
      <ToolHeader
        title="AI-SEN 통합 이용안내 & 실무 가이드"
        icon={<BookOpen size={16} className="text-blue-600" />}
        themeColor="blue"
        extraAction={
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
            title="실무 책상용 A4 2장 인쇄"
          >
            <Printer size={13} className="text-slate-500" />
            <span className="hidden sm:inline">A4 2장 인쇄</span>
          </button>
        }
      />

      {/* 메인 본문 콘텐츠 */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 sm:p-7 md:p-8">
          <ManualContent isModal={false} />
        </div>
      </main>
    </div>
  );
}
