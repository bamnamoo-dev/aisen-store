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
  FolderOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const METRICS = [
  { label: '공식 지침서', value: '102권 (13,845쪽)' },
  { label: '오피넷 실시간 유가', value: '1일 6회 자동 고시' },
  { label: '다중 경유지 길찾기', value: '최대 3개 경유지' },
  { label: '시스템 무결성 검증', value: '125개 pytest PASS' },
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
        .limit(4);
      if (posts) setRecentPosts(posts);

      const { data: docs } = await supabase
        .from('documents')
        .select('id, file_name, category, created_at, file_size')
        .order('created_at', { ascending: false })
        .limit(4);
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
    <div className="w-full max-w-[1260px] mx-auto px-6 py-7 flex flex-col gap-6">
      
      {/* ========================================================
          1. TOP COMMAND & SEARCH HERO
      ======================================================== */}
      <section className="glass-panel p-6 sm:p-8 bg-white border border-slate-200 flex flex-col gap-5 shadow-xs">
        
        {/* Title & Real-time Status Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              교육행정의 모든 기준과 계산, <span className="text-blue-600">AI-SEN</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
              102권 공식 지침서 1:1 앵커링 3-Tier RAG 챗봇과 오피넷 실시간 연동 스마트 여비정산기
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              v4.9.2 가동중
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs sm:text-sm font-bold border border-amber-200">
              <Fuel size={14} />
              오피넷 유가 연동
            </span>
          </div>
        </div>

        {/* Full-width Omnibar Search Input */}
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="궁금한 교육행정 지침(수의계약 한도, 강사료, 회계규칙 등)이나 출장비, 서식을 검색하세요..."
            className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 border border-slate-300 rounded-xl pl-12 pr-32 py-3.5 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all shadow-inner"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-5 text-sm font-bold"
          >
            <span>질의하기</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Metrics Grid Inside Hero */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          {METRICS.map((metric, idx) => (
            <div key={idx} className="flex flex-col p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-semibold">{metric.label}</span>
              <span className="text-sm sm:text-base font-black text-slate-900 mt-1">{metric.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          2. CORE 4 SERVICES (2x2 Balanced Cards Grid)
      ======================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* CARD 1: 스마트 여비정산기 & 출장 유류비 계산기 */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <Navigation size={18} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  스마트 여비정산기 &amp; 유류비 계산기
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shrink-0">
                v4.9.2
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              카카오 3개 경유지 길찾기와 오피넷 1일 6회 유가를 연동하여 관내/관외 여비 산출, 19종 법정 감액, A4 1페이지 에코 화이트 공문서 인쇄를 지원합니다.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-3.5 border-t border-slate-100">
            <a 
              href="https://chatbot.aisen.store/travel" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary flex-1 py-2.5 text-xs sm:text-sm font-bold"
            >
              <span>여비정산기 열기</span>
              <ExternalLink size={14} />
            </a>
            <Link 
              href="/tools" 
              className="btn-secondary py-2.5 px-4 text-xs sm:text-sm font-bold"
            >
              <span>미니툴 목록</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* CARD 2: 3-Tier AI-SEN 지능형 행정 챗봇 */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                  <Bot size={18} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  3-Tier AI-SEN 지능형 행정 챗봇
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 shrink-0">
                3-Tier RAG
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              28개 서고 지침서, 법령·조례, 에듀파인을 3-Tier로 격리하여 100% 원본 쪽수 뷰어(#page=N) 및 국가법령정보센터 조문 링크와 함께 정확한 답변을 제공합니다.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-3.5 border-t border-slate-100">
            <a 
              href="https://chatbot.aisen.store" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex-1 py-2.5 text-xs sm:text-sm font-bold"
            >
              <span>AI 챗봇 시작하기</span>
              <ExternalLink size={14} />
            </a>
            <Link 
              href="/archive" 
              className="btn-secondary py-2.5 px-4 text-xs sm:text-sm font-bold"
            >
              <span>지침서 서고 보기</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* CARD 3: 행정 자료실 */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                  <FolderOpen size={18} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  행정 자료실 및 지침서 서고
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                102권 공식 지침
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              28개 분야 102권 공식 지침서 PDF 원본 1:1 스트리밍 뷰어와 학교 현장 실무 서식을 통합 다운로드할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-3.5 border-t border-slate-100">
            <Link 
              href="/archive" 
              className="btn-secondary w-full py-2.5 text-xs sm:text-sm justify-center font-bold"
            >
              <span>자료실 바로가기</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* CARD 4: 업무 소통 게시판 */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
                  <MessageSquareShare size={18} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  교육행정 업무 소통 게시판
                </h3>
              </div>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 shrink-0">
                미가입 작성
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              가입 없이 닉네임과 4자리 비밀번호로 자유롭게 실무 질의, 노하우, 서식 요청 등을 공유하는 열린 소통 공간입니다.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-3.5 border-t border-slate-100">
            <Link 
              href="/board" 
              className="btn-secondary w-full py-2.5 text-xs sm:text-sm justify-center font-bold"
            >
              <span>게시판 바로가기</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>

      </section>

      {/* ========================================================
          3. REAL-TIME FEEDS
      ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Latest Posts Feed */}
        <div className="glass-panel p-6 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900">
              <MessageSquareShare size={18} className="text-blue-600" />
              <span>최신 공지 및 업무 공유</span>
            </div>
            <Link href="/board" className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 font-bold">
              더보기 &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Link 
                  key={post.id} 
                  href="/board" 
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold shrink-0">
                      {post.category || '공지'}
                    </span>
                    <span className="text-slate-800 font-semibold truncate">{post.title}</span>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 ml-2">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-5 text-center text-xs sm:text-sm text-slate-400">등록된 게시물이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Latest Docs Feed */}
        <div className="glass-panel p-6 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900">
              <FileCheck2 size={18} className="text-emerald-600" />
              <span>최신 등록 서식 문서</span>
            </div>
            <Link href="/archive" className="text-xs sm:text-sm text-slate-500 hover:text-emerald-600 font-bold">
              더보기 &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            {recentDocs.length > 0 ? (
              recentDocs.map((doc) => (
                <Link 
                  key={doc.id} 
                  href="/archive" 
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold shrink-0">
                      {doc.category || '서식'}
                    </span>
                    <span className="text-slate-800 font-semibold truncate">{doc.file_name}</span>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 ml-2">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-5 text-center text-xs sm:text-sm text-slate-400">등록된 서식이 없습니다.</div>
            )}
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="w-full pt-4 pb-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-400">
        <div>
          <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 font-semibold">
          <a href="https://chatbot.aisen.store" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">AI 챗봇</a>
          <Link href="/chatbot" className="hover:text-blue-600">구글 챗봇</Link>
          <a href="https://chatbot.aisen.store/travel" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">여비정산기</a>
          <Link href="/archive" className="hover:text-blue-600">자료실</Link>
          <Link href="/tools" className="hover:text-blue-600">미니툴</Link>
          <Link href="/board" className="hover:text-blue-600">게시판</Link>
        </div>
      </footer>

    </div>
  );
}
