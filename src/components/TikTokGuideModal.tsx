'use client';

import React, { useState } from 'react';
import {
  X,
  Monitor,
  Smartphone,
  Video,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  HelpCircle,
  PlayCircle,
  Link as LinkIcon
} from 'lucide-react';

interface TikTokGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  obsUrl: string;
  publicUrl: string;
}

export default function TikTokGuideModal({
  isOpen,
  onClose,
  obsUrl,
  publicUrl,
}: TikTokGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'studio' | 'obs' | 'mobile'>('studio');
  const [copiedObs, setCopiedObs] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);

  if (!isOpen) return null;

  const handleCopyObs = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopiedObs(true);
    setTimeout(() => setCopiedObs(false), 2000);
  };

  const handleCopyPublic = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedPublic(true);
    setTimeout(() => setCopiedPublic(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0f1118] border border-cyan-500/30 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#141722]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-rose-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <div className="w-full h-full bg-[#0f1118] rounded-[10px] flex items-center justify-center">
                <Video className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>دليل ربط الكارت مع TikTok Live خطوة بخطوة</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono border border-cyan-500/30">
                  شرح كامل
                </span>
              </h3>
              <p className="text-xs text-slate-400">اختر الطريقة التي تبث بها للاطلاع على الخطوات الدقيقة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-[#12141f]">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex-1 py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'studio'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>TikTok Live Studio (الكمبيوتر)</span>
          </button>

          <button
            onClick={() => setActiveTab('obs')}
            className={`flex-1 py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'obs'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>OBS Studio / Streamlabs</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'mobile'
                ? 'border-purple-400 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>البث من الموبايل والاستوري</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 space-y-5 text-right max-h-[65vh] overflow-y-auto">
          {/* Quick Copy Link Box */}
          <div className="p-3.5 rounded-2xl bg-[#161a26] border border-cyan-500/30 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-cyan-400">رابط الـ OBS الشفاف الخاص بك:</p>
              <p className="text-xs font-mono text-slate-300 truncate" dir="ltr">
                {obsUrl}
              </p>
            </div>
            <button
              onClick={handleCopyObs}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md transition-all"
            >
              {copiedObs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedObs ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>
          </div>

          {/* TAB 1: TikTok Live Studio */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed">
                💡 <strong>برنامج TikTok Live Studio</strong> هو البرنامج الرسمي المجاني من تيك توك المخصص للبث المباشر من الكمبيوتر.
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: '١',
                    title: 'افتح TikTok Live Studio',
                    desc: 'شغّل البرنامج وسجل دخولك بحساب التيك توك الذي ستبث من خلاله.',
                  },
                  {
                    step: '٢',
                    title: 'إضافة مصدر جديد (Add Source)',
                    desc: 'في لوحة المشاهد (Scenes) على اليسار، اضغط على زر (+ Add Source) لإضافة طبقة جديدة.',
                  },
                  {
                    step: '٣',
                    title: 'اختر رابط المتصفح (Link / Browser)',
                    desc: 'من قائمة المصادر، اختر "Link" أو "Browser Source".',
                  },
                  {
                    step: '٤',
                    title: 'الصق الرابط واضبط الأبعاد',
                    desc: 'الصق رابط الـ OBS الشفاف الذي نسخته بالأعلى. واجعل العرض (Width) = 650 والارتفاع (Height) = 400.',
                  },
                  {
                    step: '٥',
                    title: 'رتب الكارت فوق الكاميرا',
                    desc: 'اسحب الكارت وضعه في المكان المناسب فوق كاميرتك أو بجانبك. الكارت شفاف تماماً وستظهر الرسالة بداخله فور اختيارها من لوحة التحكم!',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#141722] border border-slate-800"
                  >
                    <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-xs font-black flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: OBS Studio */}
          {activeTab === 'obs' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs leading-relaxed">
                💡 <strong>OBS Studio</strong> هو البرنامج الأشهر للبث ويدعم التيك توك عبر مفتاح البث (Stream Key).
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: '١',
                    title: 'افتح OBS Studio',
                    desc: 'تأكد من فتح المشهد الخاص ببثك المباشر.',
                  },
                  {
                    step: '٢',
                    title: 'إضافة مصدر متصفح (Browser)',
                    desc: 'في نافذة المصادر (Sources) في الأسفل، اضغط زر (+) ثم اختر "Browser" (متصفح).',
                  },
                  {
                    step: '٣',
                    title: 'إعدادات المتصفح',
                    desc: 'سمّ المصدر "كارت الرسائل"، ثم الصق الرابط في خانة URL. اضبط Width = 650 و Height = 400.',
                  },
                  {
                    step: '٤',
                    title: 'تفعيل خيارات التحديث',
                    desc: 'ضع علامة صح على "Shutdown source when not visible" و "Refresh browser when scene becomes active".',
                  },
                  {
                    step: '٥',
                    title: 'حفظ ومعاينة',
                    desc: 'اضغط OK. مبروك! الكارت يظهر الآن بخلفية شفافة وتوهج نيون مباشر.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#141722] border border-slate-800"
                  >
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-xs font-black flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Mobile & Stories */}
          {activeTab === 'mobile' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs leading-relaxed">
                💡 إذا كنت تبث مباشرة من كاميرا هاتف تيك توك بدون كمبيوتر، يمكنك استخدام ميزة <strong>الشاشة الخضراء (Green Screen)</strong> أو مشاركة الكارت كاستوري!
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: '١',
                    title: 'حفظ الكارت كصورة بنقرة زر',
                    desc: 'في لوحة التحكم أثناء اللايف، اضغط زر "تصدير كصورة استوري" لتحميل الكارت كصورة PNG عالية الدقة فوراً.',
                  },
                  {
                    step: '٢',
                    title: 'استخدام الشاشة الخضراء في لايف تيك توك',
                    desc: 'أثناء تشغيل لايف التيك توك من الموبايل، اضغط على Effects (المؤثرات) واختر فلتر Green Screen، ثم حدد صورة الكارت لتظهر بجانبك على الشاشة وأنت تتكلم.',
                  },
                  {
                    step: '٣',
                    title: 'نشر الرسائل في استوري إنستغرام وتيك توك',
                    desc: 'يمكنك أيضاً نشر الصورة المحملة على الاستوري مع وضع ملصق رابط البايو الخاص بك ليقوم متابعون آخرون بإرسال رسائل جديدة.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#141722] border border-slate-800"
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center text-xs font-black flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Callout: How Followers Send Messages */}
          <div className="p-4 rounded-2xl bg-gradient-to-l from-slate-900 to-[#12141f] border border-slate-700/80 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>كيف يرسل المتابعون رسائلهم؟</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              انسخ <strong>رابط البايو العام</strong> الخاص بك وضعه في وصف حسابك (Bio) أو شاركه في الاستوري. المتابعون سيفتحون الرابط من هواتفهم ويرسلون لك بدون الحاجة لتسجيل أي حساب!
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-300 truncate max-w-xs" dir="ltr">
                {publicUrl}
              </span>
              <button
                onClick={handleCopyPublic}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold"
              >
                {copiedPublic ? 'تم النسخ!' : 'نسخ رابط البايو'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#141722] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-rose-500 text-white font-bold text-xs shadow-lg"
          >
            فهمت، إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
}
