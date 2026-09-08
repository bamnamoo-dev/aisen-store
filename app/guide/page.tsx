'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import ToolHeader from '@/components/ToolHeader';
import ManualContent from '@/components/ManualContent';

export default function GuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100/60">
      {/* 상단 툴 헤더 */}
      <ToolHeader
        title="AI-SEN 포털 & 기능별 이용안내"
        icon={<BookOpen size={16} className="text-blue-600" />}
        themeColor="blue"
      />

      {/* 메인 본문 콘텐츠 */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 sm:p-7">
          <ManualContent isModal={false} />
        </div>
      </main>
    </div>
  );
}
