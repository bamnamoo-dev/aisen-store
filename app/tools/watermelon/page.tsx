'use client';

import { useRef } from 'react';
import ToolHeader from '@/components/ToolHeader';

export default function WatermelonGamePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = 'https://project-np0t7.vercel.app/';
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-56px)] md:h-screen bg-amber-50 overflow-hidden relative">
      
      {/* 겹침 없는 통합 스마트 헤더 */}
      <ToolHeader 
        title="행정 힐링 수박 게임"
        icon={<span className="text-base">🍉</span>}
        onReload={handleReload}
      />

      {/* 원본 웹앱 100% 풀스크린 뷰어 */}
      <iframe
        ref={iframeRef}
        src="https://project-np0t7.vercel.app/"
        title="수박 게임"
        className="w-full flex-1 border-none bg-amber-50"
        allow="clipboard-read; clipboard-write; autoplay"
      />

    </div>
  );
}
