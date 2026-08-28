'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  MessageSquare, 
  Navigation, 
  FileText, 
  Zap, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  User, 
  Menu, 
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const NAV_ITEMS = [
  { name: 'AI 챗봇', href: 'https://chatbot.aisen.store', icon: <Bot size={18} />, isExternal: true, badge: '3-Tier' },
  { name: '구글 챗봇', href: '/chatbot', icon: <MessageSquare size={18} />, isExternal: false },
  { name: '출장비 계산기', href: 'https://chatbot.aisen.store/travel', icon: <Navigation size={18} />, isExternal: true, badge: 'v4.9.2' },
  { name: '행정 자료실', href: '/archive', icon: <FileText size={18} />, isExternal: false },
  { name: '미니 프로그램', href: '/tools', icon: <Zap size={18} />, isExternal: false },
  { name: '업무 게시판', href: '/board', icon: <LayoutDashboard size={18} />, isExternal: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      {/* ========================================================
          MOBILE TOP NAVBAR (Hidden on desktop md:)
      ======================================================== */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm">
            i
          </div>
          <span className="text-base font-black text-slate-900">아이센스토어</span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            Live
          </span>
        </Link>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-white z-50 p-5 flex flex-col justify-between overflow-y-auto border-t border-slate-200">
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-bold text-slate-400 px-3 mb-1">메뉴 목록</p>
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-slate-800 text-sm font-bold hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-blue-600">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-slate-600 font-medium">{user.email}</span>
                <button onClick={handleLogout} className="text-red-600 font-bold">로그아웃</button>
              </div>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          DESKTOP LEFT SIDEBAR (Fixed Left w-60)
      ======================================================== */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-200 z-40 flex-col justify-between p-4 shadow-xs">
        
        {/* Top: Logo & Main Navigation */}
        <div className="flex flex-col gap-5">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1 group">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm shadow-blue-500/25">
              i
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                  아이센스토어
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  Live
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">AI-SEN HUB v4.9.2</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-1">
              서비스 바로가기
            </p>

            {NAV_ITEMS.map((item) => {
              const isActive = !item.isExternal && pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>

                  {item.badge ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {item.badge}
                    </span>
                  ) : item.isExternal && (
                    <ExternalLink size={12} className={isActive ? 'text-white' : 'text-slate-400'} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom: User Account & System Status */}
        <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
          {user ? (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-slate-800 truncate">{user.email.split('@')[0]}님</span>
                <span className="text-[10px] text-slate-500">인증 계정</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-[11px] font-bold text-red-600 hover:bg-red-50 p-1.5 rounded-lg"
                title="로그아웃"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all border border-slate-200"
            >
              <LogIn size={14} />
              <span>로그인</span>
            </Link>
          )}

          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 pt-1">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>교육행정 AI 통합 포털</span>
          </div>
        </div>

      </aside>
    </>
  );
}
