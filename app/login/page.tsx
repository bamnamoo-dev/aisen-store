'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogIn, Loader2, UserPlus, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('회원가입이 완료되었습니다! 바로 로그인해 보세요.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#0a0e17] px-4 md:px-6 py-12 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] glass-card p-8 md:p-10 border-slate-800 bg-slate-950/80 relative z-10">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 font-bold mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>메인으로 돌아가기</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isSignUp ? '계정 생성' : '아이센스토어 로그인'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp ? '스마트 교육행정 플랫폼 회원가입' : '관리자 및 교직원 인증 로그인'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 mb-1.5 block">이메일 주소</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@sen.go.kr"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 mb-1.5 block">비밀번호</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-3 mt-2 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>처리 중...</span>
              </>
            ) : isSignUp ? (
              <>
                <UserPlus size={18} />
                <span>회원가입 완료</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>로그인</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign up / Login */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }} 
            className="text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors"
          >
            {isSignUp 
              ? '이미 계정이 있으신가요? 로그인' 
              : '계정이 없으신가요? 회원가입'}
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck size={14} className="text-slate-400" />
          <span>보안 인증 암호화 적용</span>
        </div>

      </div>
    </div>
  );
}
