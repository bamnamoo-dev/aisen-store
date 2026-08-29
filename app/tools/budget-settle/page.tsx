'use client';

import { ChartPie } from 'lucide-react';
import { useRef } from 'react';
import ToolHeader from '@/components/ToolHeader';

export default function BudgetSettlePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = 'https://bamnamoo-dev.github.io/budget-dashboard/';
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-56px)] md:h-screen bg-slate-100 overflow-hidden relative">
      
      {/* 통합 스마트 헤더 */}
      <ToolHeader 
        title="예산정산 대시보드 (K-Edu Budget)"
        icon={<ChartPie size={15} className="text-rose-600" />}
        onReload={handleReload}
      />

      {/* 전체화면 iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          ref={iframeRef}
          src="https://bamnamoo-dev.github.io/budget-dashboard/"
          className="w-full h-full border-0"
          title="예산정산 대시보드"
          allow="clipboard-write; clipboard-read"
          loading="eager"
        />
      </div>
    </div>
  );
}
