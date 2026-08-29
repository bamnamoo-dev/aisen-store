'use client';

import { Tag } from 'lucide-react';
import { useRef } from 'react';
import ToolHeader from '@/components/ToolHeader';

export default function LabelMakerPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = 'https://label-maker-two.vercel.app/';
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-56px)] md:h-screen bg-slate-100 overflow-hidden relative">
      
      {/* 겹침 없는 통합 스마트 헤더 */}
      <ToolHeader 
        title="증빙서 측면표지 라벨 제작기"
        icon={<Tag size={15} className="text-violet-600" />}
        onReload={handleReload}
      />

      {/* 원본 웹앱 100% 풀스크린 뷰어 */}
      <iframe
        ref={iframeRef}
        src="https://label-maker-two.vercel.app/"
        title="증빙서 측면표지 제작기"
        className="w-full flex-1 border-none bg-slate-50"
        allow="clipboard-read; clipboard-write; printing"
      />

    </div>
  );
}
