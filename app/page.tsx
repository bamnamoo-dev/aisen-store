'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare,
  Navigation, 
  FileText, 
  LayoutDashboard, 
  Search, 
  ExternalLink, 
  ChevronRight, 
  Fuel, 
  FileCheck2, 
  CheckCircle2, 
  ArrowRight,
  Printer,
  Layers,
  BookOpen,
  MessageSquareShare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const QUICK_CHIPS = [
  { label: '관내 출장비 계산', query: '관내 출장 여비 지급 기준 및 산출 방법' },
  { label: '1인 견적 수의계약 한도', query: '1인 견적 수의계약 체결 가능 금액 한도' },
  { label: '방과후 강사료 기준', query: '방과후학교 강사료 지급 기준 및 원천징수' },
  { label: '학교회계 규칙 조문', query: '공립학교회계 규칙 예산 및 지출 관련 조항' },
];

const METRICS = [
  { label: '공식 지침서', value: '102권 (13,845쪽)' },
  { label: '오피넷 실시간 유가', value: '1일 6회 자동 고시' },
  { label: '다중 경유지', value: '최대 3개 경유지' },
  { label: '시스템 검증', value: '125개 pytest PASS' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentData();
  }, []);

  const fetchRecentData = async () => {
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, category, created_at, board_type')
        .order('created_at', { ascending: false })
        .limit(3);
      if (posts) setRecentPosts(posts);

      const { data: docs } = await supabase
        .from('documents')
        .select('id, file_name, category, created_at, file_size')
        .order('created_at', { ascending: false })
        .limit(3);
      if (docs) setRecentDocs(docs);
    } catch (e) {
      console.error('Error loading feeds:', e);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.open(`https://chatbot.aisen.store?q=${encodeURIComponent(searchQuery.trim())}`, '_blank');
  };

  const handleChipClick = (query: string) => {
    window.open(`https://chatbot.aisen.store?q=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center pb-20 overflow-x-hidden">
      
      {/* Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1100px] h-[350px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none -z-10 blur-3xl"></div>

      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-6 flex flex-col gap-6">
        
        {/* ========================================================
            FOLD 1: Hero & Command Bar (Strictly aligned to 1100px)
        ======================================================== */}
        <section className="w-full pt-8 md:pt-12 pb-4 flex flex-col items-center text-center">
          
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-slate-300">v4.9.2 엔진 가동중</span>
            <span className="text-slate-600">|</span>
            <Fuel size={13} className="text-amber-400" />
            <span>오피넷 실시간 유가 연동</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            교육행정의 모든 기준과 계산, <span className="text-blue-400">AI-SEN</span>
          </h1>
          
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-[580px] leading-relaxed">
            102권 공식 지침서 1:1 앵커링 RAG 챗봇과 오피넷 실시간 연동 스마트 여비정산기
          </p>

          {/* Omnibar Input */}
          <div className="w-full max-w-[620px] mt-6">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="궁금한 행정 지침이나 출장비, 서식을 검색하세요..."
                className="omnibar-input"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-1.5 px-3 text-xs"
              >
                <span>검색</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip.query)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Ribbon (Full Width 1100px Aligned) */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-8 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
            {METRICS.map((metric, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-1 text-center border-r border-slate-800/60 last:border-r-0">
                <span className="text-[11px] text-slate-400 font-medium">{metric.label}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5">{metric.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            FOLD 2: 4대 벤토 그리드 (Core Services Bento)
        ======================================================== */}
        <section className="w-full py-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* CARD 1: 스마트 여비정산기 & 출장 유류비 계산기 (6 cols) */}
            <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[11px] font-bold">
                    <Navigation size={12} />
                    플래그십 v4.9.2
                  </span>
                  <span className="text-[11px] text-slate-400">오피넷 1일 6회 자동 연동</span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  공무원 스마트 여비정산기 &amp; 출장 유류비 계산기
                </h3>
                
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  카카오 길찾기와 오피넷 유가를 연동하여 출장비 산출, 19종 법정 감액, A4 1페이지 에코 화이트 인쇄를 지원합니다.
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
                    <span>3개 경유지 길찾기</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
                    <span>인사혁신처 감액 자동</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <Printer size={14} className="text-blue-400 shrink-0" />
                    <span>A4 1페이지 인쇄</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
                    <span>에듀파인 품의문구</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
                <a 
                  href="https://chatbot.aisen.store/travel" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary flex-1 py-2 text-xs"
                >
                  <span>여비정산기 열기</span>
                  <ExternalLink size={14} />
                </a>
                <Link 
                  href="/tools" 
                  className="btn-secondary py-2 text-xs"
                >
                  <span>미니툴 목록</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* CARD 2: 3-Tier AI-SEN 지능형 행정 챗봇 (6 cols) */}
            <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 text-[11px] font-bold">
                    <Bot size={12} />
                    3-Tier RAG
                  </span>
                  <span className="text-[11px] text-slate-400">102권 지침서 1:1 쪽수 앵커링</span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  3-Tier AI-SEN 지능형 행정 챗봇
                </h3>

                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  28개 서고 지침서, 법령·조례, 에듀파인을 3-Tier로 격리하여 100% 원본 쪽수 뷰어(#page=N)와 함께 정확한 답변을 제공합니다.
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <Layers size={14} className="text-indigo-400 shrink-0" />
                    <span>3-Tier 서고 완전 격리</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <BookOpen size={14} className="text-indigo-400 shrink-0" />
                    <span>0.1초 원본 PDF 뷰어</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <CheckCircle2 size={14} className="text-indigo-400 shrink-0" />
                    <span>국가법령센터 원클릭 연동</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <CheckCircle2 size={14} className="text-indigo-400 shrink-0" />
                    <span>1초 신호등 결론 뱃지</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
                <a 
                  href="https://chatbot.aisen.store" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex-1 py-2 text-xs"
                >
                  <span>AI 챗봇 시작하기</span>
                  <ExternalLink size={14} />
                </a>
                <Link 
                  href="/archive" 
                  className="btn-secondary py-2 text-xs"
                >
                  <span>지침서 서고 보기</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* CARD 3: 행정 자료실 (6 cols) */}
            <div className="lg:col-span-6 glass-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400">자료실 &amp; 서식</span>
                  <span className="text-[11px] text-slate-500">102권 공식 지침서</span>
                </div>
                <h3 className="text-base font-bold text-white">행정 자료실 및 지침서 서고</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  28개 분야 102권 공식 지침서 PDF 원본 뷰어와 학교별 실무 서식을 다운로드하세요.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">PDF 및 실무 서식 지원</span>
                <Link href="/archive" className="btn-secondary py-1.5 px-3 text-xs">
                  <span>자료실 이동</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* CARD 4: 업무 소통 게시판 (6 cols) */}
            <div className="lg:col-span-6 glass-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-emerald-400">열린 소통 광장</span>
                  <span className="text-[11px] text-slate-500">미가입 자유 작성</span>
                </div>
                <h3 className="text-base font-bold text-white">교육행정 업무 소통 게시판</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  가입 없이 닉네임과 비밀번호로 자유롭게 실무 질의와 팁을 공유하는 소통 공간입니다.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">공지 · 업무공유 · Q&amp;A</span>
                <Link href="/board" className="btn-secondary py-1.5 px-3 text-xs">
                  <span>게시판 이동</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            FOLD 3: 실시간 피드 (1100px Aligned)
        ======================================================== */}
        <section className="w-full py-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Latest Posts Feed */}
            <div className="lg:col-span-6 glass-panel p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <MessageSquareShare size={15} className="text-blue-400" />
                  <span>최신 공지 및 업무 공유</span>
                </div>
                <Link href="/board" className="text-[11px] text-slate-400 hover:text-blue-400">
                  더보기 &rarr;
                </Link>
              </div>

              <div className="flex flex-col gap-1.5">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <Link 
                      key={post.id} 
                      href="/board" 
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/60 transition-colors border border-slate-800/40 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 shrink-0">
                          {post.category || '공지'}
                        </span>
                        <span className="text-slate-200 truncate">{post.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">등록된 게시물이 없습니다.</div>
                )}
              </div>
            </div>

            {/* Latest Docs Feed */}
            <div className="lg:col-span-6 glass-panel p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <FileCheck2 size={15} className="text-emerald-400" />
                  <span>최신 등록 서식 문서</span>
                </div>
                <Link href="/archive" className="text-[11px] text-slate-400 hover:text-emerald-400">
                  더보기 &rarr;
                </Link>
              </div>

              <div className="flex flex-col gap-1.5">
                {recentDocs.length > 0 ? (
                  recentDocs.map((doc) => (
                    <Link 
                      key={doc.id} 
                      href="/archive" 
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/60 transition-colors border border-slate-800/40 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 shrink-0">
                          {doc.category || '서식'}
                        </span>
                        <span className="text-slate-200 truncate">{doc.file_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">등록된 서식이 없습니다.</div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Footer (1100px Aligned) */}
        <footer className="w-full pt-6 pb-4 mt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://chatbot.aisen.store" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200">AI 챗봇</a>
            <Link href="/chatbot" className="hover:text-slate-200">구글 챗봇</Link>
            <a href="https://chatbot.aisen.store/travel" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200">여비정산기</a>
            <Link href="/archive" className="hover:text-slate-200">자료실</Link>
            <Link href="/tools" className="hover:text-slate-200">미니툴</Link>
            <Link href="/board" className="hover:text-slate-200">게시판</Link>
          </div>
        </footer>

      </div>

    </div>
  );
}
