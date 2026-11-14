'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Radio, Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem('currentUser', data.data.username);
        router.push('/dashboard');
      } else {
        setErrorMsg(data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-rose-500/10 to-transparent blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#0f1118] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-rose-500 to-pink-500 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-rose-950/40">
            <div className="w-full h-full bg-[#0f1118] rounded-[14px] flex items-center justify-center">
              <Radio className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">تسجيل الدخول إلى حسابك</h2>
          <p className="text-xs text-slate-400">
            أدخل اسم المستخدم للوصول إلى لوحة التحكم ورسائل اللايف
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">اسم المستخدم (Username):</label>
            <div className="flex items-center bg-[#181a24] border border-slate-800 focus-within:border-cyan-400 rounded-xl px-3 py-2.5 text-sm text-white transition-all">
              <User className="w-4 h-4 text-slate-500 ml-2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="اسم المستخدم الخاص بك"
                className="bg-transparent flex-1 focus:outline-none text-cyan-400 font-bold"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">كلمة المرور:</label>
              <span className="text-[11px] text-cyan-400 font-mono">كلمة المرور الافتراضية: 123</span>
            </div>
            <div className="flex items-center bg-[#181a24] border border-slate-800 focus-within:border-cyan-400 rounded-xl px-3 py-2.5 text-sm text-white transition-all">
              <Lock className="w-4 h-4 text-slate-500 ml-2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123"
                className="bg-transparent flex-1 focus:outline-none text-white font-mono"
                dir="ltr"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-rose-500 to-pink-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-rose-950/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                <span>جاري تسجيل الدخول...</span>
              </div>
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            ليس لديك حساب بعد؟{' '}
            <Link
              href="/register"
              className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>إنشاء حساب جديد للايف</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
