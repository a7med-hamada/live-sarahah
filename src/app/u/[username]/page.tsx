'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserProfile } from '@/lib/types';
import { CheckCircle2, AlertCircle, Sparkles, Send, Lock, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';

export default function PublicSendPage() {
  const params = useParams();
  const router = useRouter();
  const username = (params?.username as string) || 'nexon';

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_CHARS = 1000;

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const res = await fetch(`/api/user/${username}`);
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        } else {
          setErrorMsg(data.error || 'المستخدم غير موجود');
        }
      } catch (err: any) {
        setErrorMsg('تعذر تحميل بيانات المستخدم');
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchUser();
    }
  }, [username]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSentSuccess(true);
        setContent('');
      } else {
        setErrorMsg(data.error || 'تعذر إرسال الرسالة، حاول مرة أخرى');
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ في الاتصال بالشبكة');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-rose-500 animate-spin"></div>
          <p className="text-sm text-slate-400">جاري تحميل الصفحة...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#12141a] border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">المستخدم غير موجود</h2>
          <p className="text-sm text-slate-400">
            تأكد من صحة الرابط أو قم بإنشاء حسابك الخاص لاستقبال الرسائل في اللايف.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
          >
            <span>العودة للرئيسية</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Subtle Ambience Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-cyan-500/10 via-rose-500/10 to-transparent blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full mx-auto relative z-10 flex-1 flex flex-col justify-center">
        {/* Top Profile Header Section (Exact matching Image 1) */}
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          {/* Avatar with TikTok Ring & Live Badge */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full tiktok-avatar-ring p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-slate-950">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* LIVE Badge */}
            {user.isLive && (
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#fe2c55] text-white text-[11px] font-black tracking-wider uppercase shadow-lg shadow-rose-900/50 flex items-center gap-1 border border-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>LIVE</span>
              </div>
            )}
          </div>

          {/* Big Name with 3D TikTok Glitch Effect */}
          <div className="pt-2">
            <h1 className="text-3xl sm:text-4xl tiktok-glitch uppercase tracking-wide">
              {user.bigTitle || `${user.displayName} Live`}
            </h1>
          </div>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-sm leading-relaxed px-2">
            {user.subtitle || 'ابعتلي أي حاجة في دماغك من غير اسم. سؤال، رأي، اعتراف... محدش هيعرف إنت مين.'}
          </p>
        </div>

        {/* Success View */}
        {sentSuccess ? (
          <div className="bg-[#12141a]/95 border border-cyan-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white">وصلت رسالتك في سرية تامة! 🚀</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                ستظهر رسالتك الآن في اللايف على شاشة <span className="text-cyan-400 font-bold">{user.displayName}</span> بدون معرفة هويتك نهائياً.
              </p>
            </div>

            <button
              onClick={() => setSentSuccess(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-rose-500 hover:opacity-95 text-white font-bold text-sm shadow-lg transition-all"
            >
              إرسال رسالة أخرى
            </button>
          </div>
        ) : (
          /* Form Card (Matching Image 1 Card Structure) */
          <form
            onSubmit={handleSend}
            className="bg-[#12141a]/95 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4"
          >
            {/* Card Header: To User & Anonymous Status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>رسالة مجهولة 100%</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">إلى: {user.displayName}</span>
                <div className="w-7 h-7 rounded-full overflow-hidden border border-cyan-400/60">
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Topic Box (Matching screenshot's "موضوع النقاش دلوقتي") */}
            <div className="p-3.5 rounded-2xl bg-[#0f1218] border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                  <span>📌</span>
                  <span>موضوع النقاش دلوقتي</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-white shadow-sm">
                  {user.topicTitle || 'مشاكل عاطفية'}
                </span>
              </div>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                {user.topicNotice || 'أي رسالة برا الموضوع ده، أو سؤال عن الشغل، مش هتظهر في اللايف 👀'}
              </p>
            </div>

            {/* Textarea Input */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                placeholder="اكتب اللي في قلبك هنا..."
                rows={4}
                required
                className="w-full bg-[#181a22] border border-slate-800 focus:border-cyan-400/70 rounded-2xl p-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all resize-none leading-relaxed"
              ></textarea>

              {/* Character Counter */}
              <div className="absolute bottom-3 left-4 text-[11px] font-mono text-slate-500">
                {MAX_CHARS - content.length}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
                {errorMsg}
              </div>
            )}

            {/* Submit Button (Matching the 3D button in Image 1) */}
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="w-full py-4 rounded-2xl tiktok-btn-3d text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>جاري الإرسال...</span>
                </div>
              ) : (
                <>
                  <span>ابعت</span>
                  <Send className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer Branding (Matching Image 1) */}
      <div className="pt-6 pb-2 text-center relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dffe00] hover:bg-[#cbe600] text-black font-extrabold text-xs tracking-wider uppercase shadow-md transition-transform hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>أنشئ رابطك الخاص للايف مجاناً</span>
        </Link>
      </div>
    </div>
  );
}
