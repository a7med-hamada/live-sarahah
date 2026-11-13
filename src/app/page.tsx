'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Radio,
  Sparkles,
  ArrowRight,
  MessageSquare,
  MonitorPlay,
  Share2,
  Lock,
  Camera,
  CheckCircle2,
  Layers,
  ChevronLeft,
  UserPlus,
  LogIn
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setCurrentUser(saved);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0d0f15]/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <div className="w-full h-full bg-[#0d0f15] rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>LIVE SARAH</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono uppercase tracking-wider">
                TIKTOK EDITION
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-rose-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>لوحة التحكم ({currentUser})</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-sm flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-rose-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>إنشاء حساب جديد</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 py-12 sm:py-20 flex-1 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-500/15 via-purple-600/15 to-rose-500/15 blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-cyan-400 text-xs font-bold shadow-lg">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>نظام الرسائل المجهولة وكروت البث المباشر على تيك توك وإنستغرام</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            استقبل رسائل متابعيك واعرضها <br className="hidden sm:inline" />
            <span className="tiktok-glitch inline-block mt-1">ككروت نيون عائمة في اللايف</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            أنشئ حسابك الخاص الآن، ضع رابطك في البايو أو الاستوري، وعندما يرسل لك المتابعون رسائل مجهولة، تظهر فوراً فوق شاشة البث المباشر (TikTok Live Studio / OBS Studio) بتصميم سينمائي متوهج!
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-rose-500 to-pink-600 hover:opacity-95 text-white font-black text-base shadow-xl shadow-rose-950/40 transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>إنشاء حساب جديد للايف</span>
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span>تسجيل الدخول لحساب موجود</span>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-right">
          <div className="p-6 rounded-3xl bg-[#0f1118]/80 border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">رابط بايو مخصص باسمك</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              صفحة إرسال جذابة جداً بالمؤثرات اللونية وموضوع النقاش وصندوق كتابة رسائل مجهولة 100%.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0f1118]/80 border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <MonitorPlay className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">ربط تلقائي مع TikTok Live</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              رابط شفاف جاهز لبرامج TikTok Live Studio و OBS Studio ليظهر الكارت فوق كاميرتك بدون خلفية.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0f1118]/80 border border-slate-800 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">تصدير للاستوري بنقرة واحدة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              حفظ أي رسالة كصورة بجودة عالية لمشاركتها على استوري تيك توك وإنستغرام بضغطة زر واحدة.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
