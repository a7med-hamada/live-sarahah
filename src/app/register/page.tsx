'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Radio, Lock, User, Sparkles, Camera, AlertCircle, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bigTitle, setBigTitle] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [subtitle, setSubtitle] = useState(
    'ابعتلي أي حاجة في دماغك من غير اسم. سؤال، رأي، اعتراف... محدش هيعرف إنت مين.'
  );
  const [topicTitle, setTopicTitle] = useState('مشاكل عاطفية');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          displayName: displayName.trim() || username.trim(),
          bigTitle: bigTitle.trim() || `${displayName || username} Live`,
          password: password.trim() || '123',
          avatarUrl,
          subtitle,
          topicTitle,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem('currentUser', data.data.username);
        router.push('/dashboard');
      } else {
        setErrorMsg(data.error || 'تعذر إنشاء الحساب');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans py-12">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-500/15 via-rose-500/15 to-transparent blur-3xl pointer-events-none"></div>

      <div className="max-w-lg w-full bg-[#0f1118] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-rose-500 to-pink-500 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-rose-950/40">
            <div className="w-full h-full bg-[#0f1118] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">إنشاء حساب جديد للايف</h2>
          <p className="text-xs text-slate-400">
            احصل على رابطك الخاص المخصص لتيك توك ولايف ستوديو في ثوانٍ
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Avatar Picker */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-20 h-20 rounded-full tiktok-avatar-ring p-1 relative group">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover bg-slate-900"
              />
              <label
                htmlFor="avatar-input"
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              >
                <Camera className="w-6 h-6" />
              </label>
              <input
                type="file"
                id="avatar-input"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <label
              htmlFor="avatar-input"
              className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>تغيير الصورة الشخصية</span>
            </label>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              اسم المستخدم (بالإنجليزية لرابط البايو):
            </label>
            <div className="flex items-center bg-[#181a24] border border-slate-800 focus-within:border-cyan-400 rounded-xl px-3 py-2.5 text-sm text-white transition-all">
              <span className="text-slate-500 text-xs font-mono ml-2" dir="ltr">
                /u/
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                }
                placeholder="اسم المستخدم مثل ahmed"
                className="bg-transparent flex-1 focus:outline-none text-cyan-400 font-bold font-mono"
                dir="ltr"
              />
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">الاسم المعروض للمتابعين:</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="مثال: أحمد"
              className="w-full bg-[#181a24] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-bold"
            />
          </div>

          {/* Big Title with 3D Preview */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              الاسم الكبير (بتأثير الـ 3D التيك توك):
            </label>
            <input
              type="text"
              value={bigTitle}
              onChange={(e) => setBigTitle(e.target.value)}
              placeholder="مثال: Ahmed Live"
              className="w-full bg-[#181a24] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-bold"
            />
            {bigTitle && (
              <div className="p-2 rounded-xl bg-black/50 border border-slate-800 text-center">
                <span className="text-xl tiktok-glitch uppercase tracking-wide">
                  {bigTitle}
                </span>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">كلمة المرور للحساب:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#181a24] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-mono"
              dir="ltr"
            />
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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-rose-500 to-pink-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-rose-950/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                <span>جاري إنشاء الحساب...</span>
              </div>
            ) : (
              <span>إنشاء الحساب والدخول للوحة التحكم</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            لديك حساب بالفعل؟{' '}
            <Link
              href="/login"
              className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>تسجيل الدخول</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
