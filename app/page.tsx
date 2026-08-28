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
  MessageSquareShare,
  FolderOpen,
  Zap
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center pb-16 overflow-x-hidden">
      
      {/* Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1100px] h-[260px] bg-gradient-to-b from-blue-100/60 to-transparent pointer-events-none -z-10 blur-3xl"></div>

      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-6 flex flex-col gap-5">
        
        {/* ========================================================
            FOLD 1: Hero & Clean Wide Search Bar
        ======================================================== */}
        <section className="w-full pt-6 md:pt-10 pb-1 flex flex-col items-center text-center">
          
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-800">v4.9.2 엔진 가동중</span>
            <span className="text-slate-300">|</span>
            <Fuel size={13} className="text-amber-500" />
            <span>오피넷 실시간 유가 연동</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            교육행정의 모든 기준과 계산, <span className="text-blue-600">AI-SEN</span>
          </h1>
          
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-[580px] leading-relaxed">
            102권 공식 지침서 1:1 앵커링 RAG 챗봇과 오피넷 실시간 연동 스마트 여비정산기
          </p>

          {/* Wide Omnibar Input */}
          <div className="w-full max-w-[860px] mt-5">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-1.5 px-4 text-xs font-bold"
              >
                <span>검색</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* Metrics Ribbon */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            {METRICS.map((metric, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-1 text-center border-r border-slate-100 last:border-r-0">
                <span className="text-[11px] text-slate-400 font-semibold">{metric.label}</span>
                <span className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">{metric.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            FOLD 2: 4대 핵심 서비스 (세로 높이 50% 축소 슬림형 카드)
        ======================================================== */}
        <section className="w-full py-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CARD 1: 스마트 여비정산기 & 출장 유류비 계산기 */}
            <div className="glass-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <Navigation size={13} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      스마트 여비정산기 &amp; 유류비 계산기
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                    v4.9.2
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                  카카오 3개 경유지 길찾기 및 오피넷 1일 6회 유가 연동 관내·외 여비 산출 (A4 1페이지 인쇄)
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <a 
                  href="https://chatbot.aisen.store/travel" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary flex-1 py-1.5 text-xs font-bold"
                >
                  <span>여비정산기 열기</span>
                  <ExternalLink size={12} />
                </a>
                <Link 
                  href="/tools" 
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  <span>미니툴</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* CARD 2: 3-Tier AI-SEN 지능형 행정 챗봇 */}
            <div className="glass-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                      <Bot size={13} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      3-Tier AI-SEN 지능형 행정 챗봇
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 shrink-0">
                    3-Tier RAG
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                  28개 서고 지침서, 법령·조례, 에듀파인 3-Tier 격리 및 100% 원본 쪽수 뷰어(#page=N)
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <a 
                  href="https://chatbot.aisen.store" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex-1 py-1.5 text-xs font-bold"
                >
                  <span>AI 챗봇 시작하기</span>
                  <ExternalLink size={12} />
                </a>
                <Link 
                  href="/archive" 
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  <span>서고 보기</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* CARD 3: 행정 자료실 */}
            <div className="glass-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                      <FolderOpen size={13} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      행정 자료실 &amp; 공식 지침서
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
                    102권 서고
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                  28개 분야 102권 공식 지침서 PDF 원본 스트리밍 및 학교별 실무 서식 다운로드
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <Link 
                  href="/archive" 
                  className="btn-secondary w-full py-1.5 text-xs justify-center"
                >
                  <span>자료실 바로가기</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* CARD 4: 업무 소통 게시판 */}
            <div className="glass-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                      <MessageSquareShare size={13} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      교육행정 업무 소통 게시판
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 shrink-0">
                    미가입 작성
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                  가입 없이 닉네임과 4자리 비밀번호로 자유롭게 실무 질의와 팁을 나누는 열린 광장
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <Link 
                  href="/board" 
                  className="btn-secondary w-full py-1.5 text-xs justify-center"
                >
                  <span>게시판 바로가기</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            FOLD 3: 실시간 피드
        ======================================================== */}
        <section className="w-full py-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Latest Posts Feed */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MessageSquareShare size={14} className="text-blue-600" />
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
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs"
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
                  <div className="py-3 text-center text-xs text-slate-400">등록된 게시물이 없습니다.</div>
                )}
              </div>
            </div>

            {/* Latest Docs Feed */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <FileCheck2 size={14} className="text-emerald-600" />
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
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs"
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
                  <div className="py-3 text-center text-xs text-slate-400">등록된 서식이 없습니다.</div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="w-full pt-5 pb-3 mt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
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
