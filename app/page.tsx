'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Bot, 
  Navigation, 
  FileText, 
  LayoutDashboard, 
  Search, 
  Sparkles, 
  ExternalLink, 
  ChevronRight, 
  Fuel, 
  ShieldCheck, 
  FileCheck2, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Printer,
  Compass,
  Layers,
  FileCode2,
  BookOpen,
  MessageSquareShare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const QUICK_CHIPS = [
  { label: '🚗 관내 출장비 계산', query: '관내 출장 여비 지급 기준 및 산출 방법' },
  { label: '📄 1인 견적 수의계약 한도', query: '1인 견적 수의계약 체결 가능 금액 한도' },
  { label: '🍱 방과후 강사료 기준', query: '방과후학교 강사료 지급 기준 및 원천징수' },
  { label: '📜 학교회계 규칙 조문', query: '공립학교회계 규칙 예산 및 지출 관련 조항' },
  { label: '📑 여비 정산서 품의문구', query: '출장 여비 품의 표준 문구 및 첨부 증빙' },
];

const METRICS = [
  { label: '공식 지침서 1:1 앵커링', value: '102권 (13,845쪽)' },
  { label: '오피넷 실시간 유가 연동', value: '1일 6회 자동 고시' },
  { label: '다중 경유지 최적 길찾기', value: '최대 3개 경유지' },
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
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col items-center pb-24 overflow-x-hidden">
      
      {/* Background Lighting Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[550px] bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent pointer-events-none -z-10 rounded-full blur-3xl"></div>
      <div className="absolute top-[300px] left-1/4 w-[400px] h-[400px] bg-blue-500/10 pointer-events-none -z-10 rounded-full blur-[120px]"></div>

      {/* ========================================================
          FOLD 1: 실무 0초 커맨드 센터 (Hero & Command Bar)
      ======================================================== */}
      <section className="w-full max-w-[1200px] px-4 md:px-6 pt-10 md:pt-14 pb-12 flex flex-col items-center text-center">
        
        {/* Real-time Status Badges Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <div className="pill-pulse shadow-lg shadow-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>AI-SEN v4.9.2 엔진 가동중</span>
          </div>
          <div className="pill-gas shadow-lg shadow-amber-500/10">
            <Fuel size={14} />
            <span>오피넷 전국 실시간 유가 연동중</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-[960px]">
          교육행정의 모든 기준과 계산,<br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
            AI-SEN으로 한 번에
          </span>
        </h1>
        
        <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-300 max-w-[760px] font-medium leading-relaxed">
          102권 공식 지침서 1:1 쪽수 앵커링 3-Tier RAG 챗봇과 카카오 모빌리티·오피넷 실시간 연동 스마트 여비정산기
        </p>

        {/* Smart Omnibar (Command Search Input) */}
        <div className="w-full max-w-[760px] mt-8">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400 transition-colors group-focus-within:text-sky-300" size={22} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 교육행정 지침이나 출장비, 수당 규정, 서식을 검색하세요..."
              className="omnibar-input text-sm sm:text-base placeholder:text-slate-500"
            />
            <button 
              type="submit" 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-xs sm:text-sm"
            >
              <span>질의하기</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-slate-400 font-bold mr-1">추천 질문:</span>
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.query)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/70 hover:border-blue-400 hover:text-white hover:bg-blue-600/20 transition-all font-medium flex items-center gap-1"
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Metrics Ribbon */}
        <div className="w-full max-w-[1000px] grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          {METRICS.map((metric, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-2 text-center border-r border-slate-800 last:border-r-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
              <span className="text-sm sm:text-base font-black text-sky-400 mt-0.5">{metric.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          FOLD 2: 4대 벤토 그리드 쇼케이스 (Core Services Bento)
      ======================================================== */}
      <section className="w-full max-w-[1200px] px-4 md:px-6 py-6">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">AI-SEN 핵심 서비스</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">교직원 행정 실무를 획기적으로 단축시키는 4대 플래그십 솔루션입니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CARD 1: 스마트 여비정산기 & 출장 유류비 계산기 (Large Card - 6 cols) */}
          <div className="lg:col-span-6 glass-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group border-blue-500/20 hover:border-blue-400/50">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
            
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-black text-blue-300">
                  <Navigation size={14} className="text-blue-400" />
                  플래그십 v4.9.2
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  오피넷 1일 6회 자동 연동
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-blue-300 transition-colors">
                공무원 스마트 여비정산기 &amp; 출장 유류비 계산기
              </h3>
              
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                카카오 모빌리티 실시간 다구간 길찾기와 한국석유공사 공인 유가를 연동하여 관내/관외 출장 여비와 자가용 유류비를 1초 만에 자동 산출합니다.
              </p>

              {/* Feature Highlights Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-sky-400 shrink-0" />
                  <span>최대 3개 다중 경유지 길찾기</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-sky-400 shrink-0" />
                  <span>인사혁신처 19종 감액 자동화</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                  <Printer size={16} className="text-sky-400 shrink-0" />
                  <span>A4 에코 화이트 1페이지 인쇄</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                  <FileCode2 size={16} className="text-sky-400 shrink-0" />
                  <span>에듀파인 품의문구 1초 복사</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-800/80">
              <a 
                href="https://chatbot.aisen.store/travel" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary flex-1 sm:flex-initial"
              >
                <span>여비정산기 실행</span>
                <ExternalLink size={16} />
              </a>
              <Link 
                href="/tools" 
                className="btn-secondary"
              >
                <span>행정 미니 프로그램 더보기</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* CARD 2: 3-Tier AI-SEN 지능형 행정 챗봇 (Large Card - 6 cols) */}
          <div className="lg:col-span-6 glass-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group border-indigo-500/20 hover:border-indigo-400/50">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-black text-indigo-300">
                  <Bot size={14} className="text-indigo-400" />
                  3-Tier RAG Engine
                </span>
                <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/20">
                  102권 지침서 1:1 쪽수 앵커링
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                3-Tier AI-SEN 지능형 행정 챗봇
              </h3>

              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                계약·예산·복무 등 28개 서고 지침서, 자치법규·상위법령, K-에듀파인 시스템을 3-Tier로 격리하여 100% 원문 근거 쪽수와 함께 답변합니다.
              </p>

              {/* Feature Highlights Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                  <Layers size={16} className="text-indigo-400 shrink-0" />
                  <span>3-Tier 서고 상호 침범 0% 차단</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                  <BookOpen size={16} className="text-indigo-400 shrink-0" />
                  <span>0.1초 원본 PDF (#page=N) 뷰어</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>국가법령정보센터 조문 원클릭 연동</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                  <Sparkles size={16} className="text-indigo-400 shrink-0" />
                  <span>1초 신호등 결론 &amp; 질문 자동 보정</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-800/80">
              <a 
                href="https://chatbot.aisen.store" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary bg-gradient-to-r from-indigo-600 to-blue-600 border-indigo-400/30 flex-1 sm:flex-initial"
              >
                <span>AI 챗봇 시작하기</span>
                <ExternalLink size={16} />
              </a>
              <Link 
                href="/archive" 
                className="btn-secondary"
              >
                <span>102권 지침서 서고 바로가기</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* CARD 3: 행정 자료실 (/archive - 6 cols) */}
          <div className="lg:col-span-6 glass-card p-6 md:p-8 flex flex-col justify-between border-slate-800 hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                  <FileText size={14} className="text-blue-400" />
                  중앙 아카이브
                </span>
                <span className="text-xs text-slate-400">102권 공식 지침서 스트리밍</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">행정 자료실 &amp; 공식 지침서</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                28개 분야 102권 공식 지침서 PDF 원본 1:1 스트리밍 뷰어와 학교별 실무 서식, 기안문, 엑셀 템플릿을 한눈에 열람하고 다운로드하세요.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400">PDF 다운로드 및 1:1 쪽수 뷰어 지원</span>
              <Link href="/archive" className="btn-secondary py-2 px-4 text-xs font-bold">
                <span>자료실 바로가기</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* CARD 4: 업무 소통 게시판 (/board - 6 cols) */}
          <div className="lg:col-span-6 glass-card p-6 md:p-8 flex flex-col justify-between border-slate-800 hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                  <LayoutDashboard size={14} className="text-emerald-400" />
                  열린 광장
                </span>
                <span className="text-xs font-bold text-emerald-400">미가입 4자리 비밀번호 자유 작성</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">교육행정 업무 소통 게시판</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                로그인 없이도 닉네임과 4자리 비밀번호로 자유롭게 실무 질의응답을 남기고, 교직원 간의 업무 팁과 긴급 협조 공지를 공유합니다.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">공지사항 · 업무공유 · 질의응답</span>
              <Link href="/board" className="btn-secondary py-2 px-4 text-xs font-bold">
                <span>게시판 입장하기</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          FOLD 3: 실시간 포털 피드 & 공공 보안 신뢰성
      ======================================================== */}
      <section className="w-full max-w-[1200px] px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Latest Posts Live Feed (6 cols) */}
          <div className="lg:col-span-6 glass-panel p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquareShare size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">최신 공지 및 업무 공유</h3>
              </div>
              <Link href="/board" className="text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors">
                전체보기 &rarr;
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <Link 
                    key={post.id} 
                    href="/board" 
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 transition-all border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 shrink-0">
                        {post.category || '공지'}
                      </span>
                      <span className="text-sm font-medium text-slate-200 truncate">{post.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-3">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">등록된 게시물이 없습니다.</div>
              )}
            </div>
          </div>

          {/* Latest Documents Feed (6 cols) */}
          <div className="lg:col-span-6 glass-panel p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 size={18} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">최신 행정 서식 및 문서</h3>
              </div>
              <Link href="/archive" className="text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors">
                전체보기 &rarr;
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {recentDocs.length > 0 ? (
                recentDocs.map((doc) => (
                  <Link 
                    key={doc.id} 
                    href="/archive" 
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 transition-all border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 shrink-0">
                        {doc.category || '서식'}
                      </span>
                      <span className="text-sm font-medium text-slate-200 truncate">{doc.file_name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-3">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">등록된 서식 문서가 없습니다.</div>
              )}
            </div>
          </div>

        </div>

        {/* Security & Reliability Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-indigo-950/40 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 className="text-base font-black text-white">공공기관 보안 및 신뢰성 아키텍처</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                스쿨넷(학교망 NAT) 세션 UUID 격리, 시스템 프롬프트 가드레일, 125개 pytest 전수 검증 통과
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
              100% 무결성 통과
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}
      <footer className="w-full max-w-[1200px] px-4 md:px-6 pt-12 mt-12 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-300">AI-SEN STORE</span>
          <span>&copy; 2026 스마트 교육행정 AI 플랫폼. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 font-medium">
          <a href="https://chatbot.aisen.store" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">AI 챗봇</a>
          <a href="https://chatbot.aisen.store/travel" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">여비정산기</a>
          <Link href="/archive" className="hover:text-blue-400">자료실</Link>
          <Link href="/tools" className="hover:text-blue-400">미니툴</Link>
          <Link href="/board" className="hover:text-blue-400">게시판</Link>
        </div>
      </footer>

    </div>
  );
}
