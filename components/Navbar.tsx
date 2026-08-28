'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Navigation, FileText, Zap, LayoutDashboard, LogIn, LogOut, User, Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const NAV_ITEMS = [
  { name: 'AI 챗봇', href: 'https://chatbot.aisen.store', icon: <Bot size={18} />, isExternal: true, badge: '3-Tier RAG' },
  { name: '출장비 계산기', href: 'https://chatbot.aisen.store/travel', icon: <Navigation size={18} />, isExternal: true, badge: 'v4.9.2' },
  { name: '행정 자료실', href: '/archive', icon: <FileText size={18} />, isExternal: false },
  { name: '미니 프로그램', href: '/tools', icon: <Zap size={18} />, isExternal: false },
  { name: '업무 게시판', href: '/board', icon: <LayoutDashboard size={18} />, isExternal: false },
];

export default function Navbar() {
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
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 h-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30 group-hover:scale-105 transition-all">
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                아이센스토어
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE
              </span>
            </div>
            <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase -mt-0.5">
              AI-SEN HUB
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
          {NAV_ITEMS.map((item) => {
            const isActive = !item.isExternal && pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-blue-400'}>{item.icon}</span>
                <span>{item.name}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 font-extrabold tracking-tight">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Controls (Auth / User) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900/80 pl-3 pr-1.5 py-1.5 rounded-xl border border-slate-800">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-200">{user.email.split('@')[0]}님</span>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider">
                  {user.email === 'bamnamoo@gmail.com' ? '👑 관리자' : '인증회원'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="w-8 h-8 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all border border-red-500/20"
                title="로그아웃"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="btn-secondary py-2 px-4 text-xs font-bold"
            >
              <LogIn size={15} />
              <span>로그인</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 px-6 py-5 flex flex-col gap-3">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              target={item.isExternal ? '_blank' : undefined}
              rel={item.isExternal ? 'noopener noreferrer' : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 font-bold hover:bg-blue-600/20 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <span className="text-blue-400">{item.icon}</span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/20">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-300">{user.email}</span>
                <button onClick={handleLogout} className="text-xs text-red-400 font-bold">로그아웃</button>
              </div>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
