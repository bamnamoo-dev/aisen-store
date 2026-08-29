'use client';

import { ChartPie } from 'lucide-react';
import { useRef } from 'react';
import ToolHeader from '@/components/ToolHeader';

export default function SFDDashboardPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = 'https://bamnamoo-dev.github.io/SFD/';
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-56px)] md:h-screen bg-slate-100 overflow-hidden relative">
      
      {/* 겹침 없는 통합 스마트 헤더 */}
      <ToolHeader 
        title="학교회계 통합 정보 대시보드 (SFD)"
        icon={<ChartPie size={15} className="text-teal-600" />}
        onReload={handleReload}
      />

      {/* 원본 SFD 대시보드 웹앱 100% 풀스크린 뷰어 */}
      <iframe
        ref={iframeRef}
        src="https://bamnamoo-dev.github.io/SFD/"
        title="학교회계 대시보드 (SFD)"
        className="w-full flex-1 border-none bg-slate-50"
        allow="clipboard-read; clipboard-write; printing"
      />

    </div>
  );
}
