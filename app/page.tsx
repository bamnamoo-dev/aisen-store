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
  ArrowRight,
  MessageSquareShare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center pb-20 overflow-x-hidden">
      
      {/* Background Accent - Subtle Light Blue Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1100px] h-[300px] bg-gradient-to-b from-blue-100/60 to-transparent pointer-events-none -z-10 blur-3xl"></div>

      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-6 flex flex-col gap-6">
        
        {/* ========================================================
            FOLD 1: Hero & Clean Wide Search Bar
        ======================================================== */}
        <section className="w-full pt-8 md:pt-12 pb-2 flex flex-col items-center text-center">
          
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-700">v4.9.2 엔진 가동중</span>
            <span className="text-slate-300">|</span>
            <Fuel size={13} className="text-amber-500" />
            <span>오피넷 실시간 유가 연동</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            교육행정의 모든 기준과 계산, <span className="text-blue-600">AI-SEN</span>
          </h1>
          
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-[580px] leading-relaxed">
            102권 공식 지침서 1:1 앵커링 RAG 챗봇과 오피넷 실시간 연동 스마트 여비정산기
          </p>

          {/* Wide Omnibar Input */}
          <div className="w-full max-w-[860px] mt-6">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="궁금한 교육행정 지침이나 출장비 규정, 서식을 검색하세요..."
                className="omnibar-input pl-11 pr-24"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-1.5 px-4 text-xs font-semibold"
              >
                <span>검색</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* Metrics Ribbon */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-7 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
            {METRICS.map((metric, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-1 text-center border-r border-slate-100 last:border-r-0">
                <span className="text-[11px] text-slate-400 font-medium">{metric.label}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{metric.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            FOLD 2: 4대 핵심 서비스 (Clean White Cards)
        ======================================================== */}
        <section className="w-full py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* CARD 1: 스마트 여비정산기 & 출장 유류비 계산기 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">
                    <Navigation size={12} />
                    여비정산기 v4.9.2
                  </span>
                  <span className="text-[11px] text-slate-400">오피넷 1일 6회 자동 연동</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  공무원 스마트 여비정산기 &amp; 출장 유류비 계산기
                </h3>
                
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  카카오 모빌리티 3개 경유지 길찾기와 오피넷 유가를 연동하여 관내/관외 출장비 산출, 19종 법정 감액, A4 1페이지 에코 화이트 공문서 인쇄를 지원합니다.
                </p>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
                <a 
                  href="https://chatbot.aisen.store/travel" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary flex-1 py-2 text-xs"
                >
                  <span>여비정산기 열기</span>
                  <ExternalLink size={13} />
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

            {/* CARD 2: 3-Tier AI-SEN 지능형 행정 챗봇 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[11px] font-bold border border-indigo-100">
                    <Bot size={12} />
                    3-Tier RAG Engine
                  </span>
                  <span className="text-[11px] text-slate-400">102권 지침서 1:1 쪽수 앵커링</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  3-Tier AI-SEN 지능형 행정 챗봇
                </h3>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  28개 서고 지침서, 법령·조례, 에듀파인을 3-Tier로 격리하여 100% 원본 쪽수 뷰어(#page=N) 및 국가법령정보센터 조문 링크와 함께 답변합니다.
                </p>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
                <a 
                  href="https://chatbot.aisen.store" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex-1 py-2 text-xs"
                >
                  <span>AI 챗봇 시작하기</span>
                  <ExternalLink size={13} />
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

            {/* CARD 3: 행정 자료실 */}
            <div className="glass-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500">자료실 &amp; 서식</span>
                  <span className="text-[11px] text-slate-400">102권 공식 지침서</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">행정 자료실 및 지침서 서고</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  28개 분야 102권 공식 지침서 PDF 원본 뷰어와 학교별 실무 서식을 다운로드하세요.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">PDF 및 실무 서식 지원</span>
                <Link href="/archive" className="btn-secondary py-1.5 px-3 text-xs">
                  <span>자료실 이동</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* CARD 4: 업무 소통 게시판 */}
            <div className="glass-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-emerald-600">열린 소통 광장</span>
                  <span className="text-[11px] text-slate-400">미가입 자유 작성</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">교육행정 업무 소통 게시판</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  가입 없이 닉네임과 비밀번호로 자유롭게 실무 질의와 노하우를 공유하는 공간입니다.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">공지 · 업무공유 · Q&amp;A</span>
                <Link href="/board" className="btn-secondary py-1.5 px-3 text-xs">
                  <span>게시판 이동</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            FOLD 3: 실시간 피드
        ======================================================== */}
        <section className="w-full py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Latest Posts Feed */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MessageSquareShare size={15} className="text-blue-600" />
                  <span>최신 공지 및 업무 공유</span>
                </div>
                <Link href="/board" className="text-[11px] text-slate-500 hover:text-blue-600">
                  더보기 &rarr;
                </Link>
              </div>

              <div className="flex flex-col gap-1.5">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <Link 
                      key={post.id} 
                      href="/board" 
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium shrink-0">
                          {post.category || '공지'}
                        </span>
                        <span className="text-slate-700 font-medium truncate">{post.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">등록된 게시물이 없습니다.</div>
                )}
              </div>
            </div>

            {/* Latest Docs Feed */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <FileCheck2 size={15} className="text-emerald-600" />
                  <span>최신 등록 서식 문서</span>
                </div>
                <Link href="/archive" className="text-[11px] text-slate-500 hover:text-emerald-600">
                  더보기 &rarr;
                </Link>
              </div>

              <div className="flex flex-col gap-1.5">
                {recentDocs.length > 0 ? (
                  recentDocs.map((doc) => (
                    <Link 
                      key={doc.id} 
                      href="/archive" 
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium shrink-0">
                          {doc.category || '서식'}
                        </span>
                        <span className="text-slate-700 font-medium truncate">{doc.file_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">등록된 서식이 없습니다.</div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="w-full pt-6 pb-4 mt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <a href="https://chatbot.aisen.store" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">AI 챗봇</a>
            <Link href="/chatbot" className="hover:text-blue-600">구글 챗봇</Link>
            <a href="https://chatbot.aisen.store/travel" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">여비정산기</a>
            <Link href="/archive" className="hover:text-blue-600">자료실</Link>
            <Link href="/tools" className="hover:text-blue-600">미니툴</Link>
            <Link href="/board" className="hover:text-blue-600">게시판</Link>
          </div>
        </footer>

      </div>

    </div>
  );
}
