'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogIn, Loader2, UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#f8fafc] px-4 md:px-6 py-12">
      <div className="w-full max-w-[420px] bg-white p-8 md:p-9 rounded-2xl shadow-sm border border-slate-200">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-bold mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>메인으로 돌아가기</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20 font-black text-lg">
            i
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isSignUp ? '회원가입' : '아이센스토어 로그인'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSignUp ? '스마트 교육행정 플랫폼 계정 생성' : '관리자 및 교직원 인증 로그인'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">이메일 주소</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@sen.go.kr"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">비밀번호</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-2 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>처리 중...</span>
              </>
            ) : isSignUp ? (
              <>
                <UserPlus size={16} />
                <span>가입 완료</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>로그인</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign up / Login */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }} 
            className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            {isSignUp 
              ? '이미 계정이 있으신가요? 로그인' 
              : '계정이 없으신가요? 회원가입'}
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck size={13} className="text-slate-400" />
          <span>보안 인증 암호화 적용</span>
        </div>

      </div>
    </div>
  );
}
