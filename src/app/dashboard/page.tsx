'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, AnonymousMessage, CardCustomization } from '@/lib/types';
import LiveCard from '@/components/LiveCard';
import TikTokGuideModal from '@/components/TikTokGuideModal';
import {
  MessageSquare,
  Radio,
  Settings,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Pin,
  Eye,
  Download,
  Sparkles,
  Camera,
  MonitorPlay,
  User,
  LogOut,
  HelpCircle,
  Video,
  ChevronLeft,
  ChevronRight,
  FastForward,
  Play,
  Bell,
  Clock,
  Sliders,
  Type,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Image as ImageIcon,
  Save,
  Palette,
  EyeOff,
  SunMedium,
  Minus,
  Sparkle,
  Layers,
  Volume2,
  VolumeX,
  Shield,
  Film,
  PlayCircle,
  Zap,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { playSound, SOUND_PRESETS, SoundTheme } from '@/lib/sounds';
import { TITLE_EFFECTS, TITLE_EFFECT_CATEGORIES, getTitleEffect } from '@/lib/titleEffects';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'messages' | 'settings'>('live');
  const [activeOverlayMsgId, setActiveOverlayMsgId] = useState<string | null>(null);
  const [skipOffset, setSkipOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedObs, setCopiedObs] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingCardConfig, setSavingCardConfig] = useState(false);
  const [cardSaveSuccess, setCardSaveSuccess] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'pinned'>('all');
  const [showGuideModal, setShowGuideModal] = useState(false);

  const [previewBg, setPreviewBg] = useState<'camera' | 'game' | 'grid'>('camera');
  const [previewAnimKey, setPreviewAnimKey] = useState<number>(0);

  // Card Customization state (live adjustable controls)
  const [cardConfig, setCardConfig] = useState<CardCustomization>({
    messageFontSize: 26,
    nameFontSize: 15,
    footerFontSize: 12,
    avatarSize: 28,
    showAvatar: true,
    showName: true,
    cardHeaderName: '',
    textAlign: 'right',
    badgeText: 'رسالة مجهولة 💌',
    bgType: 'transparent',
    bgColor: '#000000',
    bgOpacity: 0,
    messageColor: '#ffffff',
    nameColor: '#ffffff',
    footerColor: '#67e8f9',
    borderTheme: 'tiktok',
    customBorderColor: '#00f2fe',
    borderWidth: 3.5,
    showDividers: true,
    dividerColor: '#000000',
    dividerThickness: 2,
    dividerOpacity: 85,
    blurAmount: 0,
    enableSoundAlert: true,
    soundTheme: 'tiktokDing',
    soundVolume: 80,
    animationType: 'slideUp',
    enableProfanityFilter: true,
    profanityAction: 'censor',
    customBlockedWords: '',
    titleEffect: 'tiktokClassic',
  });

  const [titleEffectCategory, setTitleEffectCategory] = useState<string>('all');

  // Profile Form state
  const [formData, setFormData] = useState({
    displayName: '',
    bigTitle: '',
    subtitle: '',
    topicTitle: '',
    topicNotice: '',
    avatarUrl: '',
    isLive: true,
  });

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const savedUsername = localStorage.getItem('currentUser');

      if (!savedUsername) {
        const usersRes = await fetch('/api/auth/users');
        const usersData = await usersRes.json();
        if (usersData.success && usersData.data && usersData.data.length > 0) {
          const firstUser = usersData.data[0].username;
          localStorage.setItem('currentUser', firstUser);
          await fetchUserData(firstUser);
        } else {
          router.push('/register');
          return;
        }
      } else {
        await fetchUserData(savedUsername);
      }
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (username: string) => {
    const userRes = await fetch(`/api/user/${username}`);
    const userData = await userRes.json();

    if (userData.success && userData.data) {
      setCurrentUser(userData.data);
      setActiveOverlayMsgId(userData.data.activeOverlayMessageId || null);

      // Load card customization
      const userCardCfg: CardCustomization = userData.data.cardCustomization || {};
      setCardConfig((prev) => ({
        ...prev,
        ...userCardCfg,
        cardHeaderName: userCardCfg.cardHeaderName || userData.data.displayName || prev.cardHeaderName,
        titleEffect: userCardCfg.titleEffect || 'tiktokClassic',
      }));

      setFormData({
        displayName: userData.data.displayName || '',
        bigTitle: userData.data.bigTitle || '',
        subtitle: userData.data.subtitle || '',
        topicTitle: userData.data.topicTitle || '',
        topicNotice: userData.data.topicNotice || '',
        avatarUrl: userData.data.avatarUrl || '',
        isLive: userData.data.isLive !== false,
      });

      // Get messages
      const msgRes = await fetch(`/api/messages?username=${username}`);
      const msgData = await msgRes.json();
      if (msgData.success) {
        setMessages(msgData.data);
        if (!userData.data.activeOverlayMessageId && msgData.data.length > 0) {
          setActiveOverlayMsgId(msgData.data[0].id);
        }
      }
    } else {
      localStorage.removeItem('currentUser');
      router.push('/login');
    }
  };

  useEffect(() => {
    loadUserData();

    const interval = setInterval(() => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        fetch(`/api/messages?username=${savedUser}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.success) setMessages(d.data);
          })
          .catch(() => {});
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const handleCopyLink = () => {
    if (!currentUser) return;
    const url = `${window.location.origin}/u/${currentUser.username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyObs = () => {
    if (!currentUser) return;
    const url = `${window.location.origin}/overlay/${currentUser.username}`;
    navigator.clipboard.writeText(url);
    setCopiedObs(true);
    setTimeout(() => setCopiedObs(false), 2000);
  };

  const handleSetOverlayMsg = async (msgId: string | null) => {
    if (!currentUser) return;
    setActiveOverlayMsgId(msgId);
    setSkipOffset(0);

    try {
      await fetch(`/api/overlay/${currentUser.username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: msgId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCardCustomization = async () => {
    if (!currentUser) return;
    setSavingCardConfig(true);
    setCardSaveSuccess(false);

    try {
      const res = await fetch(`/api/user/${currentUser.username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardCustomization: cardConfig }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.data);
        setCardSaveSuccess(true);
        setTimeout(() => setCardSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCardConfig(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('هل تريد حذف هذه الرسالة؟')) return;
    try {
      const res = await fetch(`/api/messages/${msgId}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        if (activeOverlayMsgId === msgId) {
          const remaining = messages.filter((m) => m.id !== msgId);
          handleSetOverlayMsg(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (msg: AnonymousMessage) => {
    try {
      const nextPinned = !msg.isPinned;
      await fetch(`/api/messages/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: nextPinned }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isPinned: nextPinned } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSavingSettings(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/user/${currentUser.username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportCard = async () => {
    try {
      const { toPng } = await import('html-to-image');
      const node = document.getElementById('live-card-element');
      if (!node) return;

      const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `live-card-${currentUser?.username || 'stream'}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting image:', err);
      alert('تعذر تحميل الصورة مباشرة، يمكنك أخذ لقطة شاشة للكارت');
    }
  };

  const activeMsg = messages.find((m) => m.id === activeOverlayMsgId) || null;

  const newerMessages = activeMsg
    ? messages.filter((m) => m.createdAt > activeMsg.createdAt).sort((a, b) => a.createdAt - b.createdAt)
    : [];

  const newerCount = newerMessages.length;
  const nextInLineMsg = newerMessages.length > skipOffset ? newerMessages[skipOffset] : null;

  const handleSkipNext = () => {
    if (skipOffset + 1 < newerMessages.length) {
      setSkipOffset((prev) => prev + 1);
    } else {
      alert('لا توجد رسائل أخرى في الانتظار لتخطيها حالياً');
    }
  };

  const handleShowNextInLine = () => {
    if (nextInLineMsg) {
      handleSetOverlayMsg(nextInLineMsg.id);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread') return !m.isRead;
    if (filter === 'pinned') return m.isPinned;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-rose-500 animate-spin"></div>
          <p className="text-sm text-slate-400">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  const currentPublicUrl = typeof window !== 'undefined' && currentUser ? `${window.location.origin}/u/${currentUser.username}` : '';
  const currentObsUrl = typeof window !== 'undefined' && currentUser ? `${window.location.origin}/overlay/${currentUser.username}` : '';

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col font-sans">
      {/* Detailed TikTok Connection Modal */}
      <TikTokGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        obsUrl={currentObsUrl}
        publicUrl={currentPublicUrl}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0d0f15]/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <div className="w-full h-full bg-[#0d0f15] rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>ستوديو الرسائل المباشرة</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              أهلاً بك، <span className="text-cyan-400 font-bold">{currentUser?.displayName || currentUser?.username}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && (
            <>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-sm cursor-pointer"
                title="نسخ رابط البايو"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedLink ? 'تم نسخ الرابط!' : 'نسخ رابط البايو'}</span>
              </button>

              <Link
                href={`/u/${currentUser.username}`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/40"
              >
                <span>معاينة صفحة الإرسال</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'live'
                ? 'bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MonitorPlay className="w-4 h-4" />
            <span>كارت البث والـ OBS (تيك توك لايف)</span>
            {activeOverlayMsgId && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>صندوق الرسائل الواردة</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-white">
              {messages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>تخصيص البروفايل والرابط</span>
          </button>
        </div>

        {/* TAB 1: LIVE SIMULATOR & OBS OVERLAY */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Top OBS Banner & Quick Setup */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#11131c] to-cyan-950/40 border border-cyan-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-2 text-center md:text-right flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                  <Video className="w-3.5 h-3.5" />
                  <span>ربط الكارت مع TikTok Live Studio أو OBS Studio</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  التحكم المباشر في الخطوط الفاصلة، البلور الضبابي، وشفافية الكارت
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  يمكنك تفعيل تأثير البلور الضبابي الشفاف (Blur) خلف الكارت، والتحكم في سمك ولون الخطين الفاصلين الأسودين بدقة متناهية!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-center">
                <button
                  onClick={handleCopyObs}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
                >
                  {copiedObs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedObs ? 'تم نسخ الرابط!' : 'نسخ رابط الـ OBS الشفاف'}</span>
                </button>

                <button
                  onClick={() => setShowGuideModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>دليل الربط بالتفصيل 📖</span>
                </button>

                <button
                  onClick={handleExportCard}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                  title="تحميل الكارت المعروض حالياً كصورة للاستوري"
                >
                  <Download className="w-4 h-4 text-rose-400" />
                  <span>تصدير كصورة استوري</span>
                </button>
              </div>
            </div>

            {/* QUEUE STATUS BAR */}
            <div className="p-4 rounded-2xl bg-[#0f1118] border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-rose-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">طابور الرسائل الجديدة:</span>
                    {newerCount > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-950/50 animate-pulse">
                        +{newerCount} رسائل جديدة وصلت بعد هذه الرسالة
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                        ✓ أنت واقف على أحدث رسالة حالياً
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    اللايف ثابت على الرسالة الحالية، ولن تتغير إلا بإرادتك عبر الأزرار بالأسفل.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-slate-300 font-bold">الكارت متصل بالبث المباشر</span>
              </div>
            </div>

            {/* NEXT MESSAGE PREVIEW & SKIP BOX */}
            {newerCount > 0 && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-[#141824] to-[#121520] border-2 border-dashed border-cyan-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-xs border border-cyan-500/40 flex items-center gap-1">
                      <span>👀 معاينة الرسالة القادمة</span>
                      {skipOffset > 0 && (
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full">
                          (تم تخطي {skipOffset})
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      متبقي في الطابور: {newerCount - skipOffset} رسالة
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {nextInLineMsg ? new Date(nextInLineMsg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                {nextInLineMsg ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-black/50 border border-slate-800 text-right">
                      <p className="text-white text-base font-bold leading-relaxed">
                        {nextInLineMsg.content}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <button
                          onClick={handleShowNextInLine}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-rose-500 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>عرض هذه الرسالة في اللايف الآن</span>
                        </button>

                        <button
                          onClick={handleSkipNext}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black text-xs transition-all cursor-pointer shadow-sm"
                          title="تخطي هذه الرسالة ومعاينة الرسالة التي بعدها"
                        >
                          <FastForward className="w-3.5 h-3.5" />
                          <span>سكب (تخطي للرسالة التي بعدها) ⏭️</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteMessage(nextInLineMsg.id)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف هذه الرسالة</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 text-center text-xs text-slate-400">
                    تم تخطي جميع الرسائل في الطابور! اضغط "الرسالة السابقة" للرجوع إليها.
                  </div>
                )}
              </div>
            )}

            {/* Live Stream Viewport Mockup */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 aspect-[9/16] sm:aspect-[16/10] max-w-3xl mx-auto flex flex-col justify-between p-4 sm:p-6">
              {/* 1. Simulated Backdrop Image / Video (Placed FIRST in DOM for correct backdrop-filter capture) */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {previewBg === 'camera' && (
                  <img
                    src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80"
                    alt="Streamer Camera Simulation"
                    className="w-full h-full object-cover opacity-85 filter brightness-95 contrast-110"
                  />
                )}
                {previewBg === 'game' && (
                  <img
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"
                    alt="Gaming Live Stream Simulation"
                    className="w-full h-full object-cover opacity-90 filter contrast-125 saturate-125"
                  />
                )}
                {previewBg === 'grid' && (
                  <div
                    className="w-full h-full bg-[#07080a]"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #161a26 25%, transparent 25%), linear-gradient(-45deg, #161a26 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #161a26 75%), linear-gradient(-45deg, transparent 75%, #161a26 75%)',
                      backgroundSize: '24px 24px',
                      backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"></div>
              </div>

              {/* 2. Top Header Controls & Background Switcher */}
              <div className="relative z-10 flex items-center justify-between text-xs text-white pb-2">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-rose-500">
                    <img
                      src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs">{currentUser?.displayName || currentUser?.username}</p>
                    <p className="text-[10px] text-rose-400 font-mono">❤️ 23.2K</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                    + Follow
                  </span>
                </div>

                {/* Live Background Switcher for testing Blur */}
                <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-full border border-white/15 text-[11px] font-bold">
                  <button
                    onClick={() => setPreviewBg('camera')}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      previewBg === 'camera'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📷 كاميرا لايف
                  </button>
                  <button
                    onClick={() => setPreviewBg('game')}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      previewBg === 'game'
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎮 لعبة نيون
                  </button>
                  <button
                    onClick={() => setPreviewBg('grid')}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      previewBg === 'grid'
                        ? 'bg-cyan-500 text-black shadow-sm font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🏁 شطرنج OBS
                  </button>
                </div>
              </div>

              {/* 3. The Live Floating Card with Customizations */}
              <div
                key={previewAnimKey}
                className={`my-auto relative z-10 w-full flex justify-center py-4 anim-${cardConfig.animationType || 'slideUp'}`}
              >
                <LiveCard
                  user={currentUser || { displayName: 'Streamer', bigTitle: 'Live Stream' }}
                  message={activeMsg}
                  customization={cardConfig}
                />
              </div>

              {/* 4. Simulated TikTok Live Bottom Chat */}
              <div className="relative z-10 flex items-center justify-between text-xs text-white pt-2">
                <div className="space-y-1">
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-slate-300 text-[11px] inline-block border border-white/10">
                    💬 <span className="text-cyan-400 font-bold">متابع:</span> عاش يا بطل أحلى لايف 🔥
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-rose-500 text-lg animate-pulse">❤️</span>
                  <span className="text-rose-500 text-lg animate-bounce">❤️</span>
                </div>
              </div>
            </div>

            {/* Quick Cycle & Navigation Controls */}
            {messages.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const currentIdx = messages.findIndex((m) => m.id === activeOverlayMsgId);
                    const prevIdx = currentIdx < messages.length - 1 ? currentIdx + 1 : 0;
                    handleSetOverlayMsg(messages[prevIdx].id);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>الرسالة الأقدم (السابقة)</span>
                </button>

                <button
                  onClick={() => handleSetOverlayMsg(activeOverlayMsgId ? null : (messages[0]?.id || null))}
                  className="px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 transition-all cursor-pointer"
                >
                  {activeOverlayMsgId ? 'إخفاء الكارت مؤقتاً من البث' : 'إظهار الكارت على البث'}
                </button>

                {nextInLineMsg && (
                  <button
                    onClick={handleSkipNext}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    <FastForward className="w-4 h-4" />
                    <span>سكب الرسالة التالية ⏭️</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const currentIdx = messages.findIndex((m) => m.id === activeOverlayMsgId);
                    const nextIdx = currentIdx > 0 ? currentIdx - 1 : messages.length - 1;
                    handleSetOverlayMsg(messages[nextIdx].id);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                >
                  <span>الرسالة الأحدث (التالية)</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* DEDICATED VISUAL SIZES, COLORS & TRANSPARENCY CUSTOMIZATION PANEL */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0f1118] border border-cyan-500/30 shadow-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-cyan-400" />
                    <span>تخصيص الخطوط الفاصلة، البلور الضبابي، وشفافية الكارت</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    يمكنك تفعيل البلور الضبابي الشفاف بدون ألوان، والتحكم في سمك ولون الخطين الفاصلين بدقة!
                  </p>
                </div>

                <button
                  onClick={handleSaveCardCustomization}
                  disabled={savingCardConfig}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-rose-500 hover:opacity-95 text-white font-black text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
                >
                  {savingCardConfig ? (
                    <span>جاري الحفظ...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ الإعدادات للايف والـ OBS</span>
                    </>
                  )}
                </button>
              </div>

              {cardSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold animate-in fade-in">
                  ✓ تم حفظ إعدادات الخطين، البلور، والشفافية بنجاح وتم تحديث رابط الـ OBS تلقائياً!
                </div>
              )}

              {/* SECTION 1: BORDER THEMES & COLORS (ألوان وثيمات إطار النيون) */}
              <div className="p-5 rounded-2xl bg-[#141724] border border-cyan-500/20 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm font-black text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>ألوان وثيمات إطار النيون:</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {cardConfig.borderTheme === 'tiktok'
                      ? 'تيك توك كلاسيكي (سماوي وفوشيا)'
                      : cardConfig.borderTheme === 'cyan'
                      ? 'سماوي سايبر نيون'
                      : cardConfig.borderTheme === 'purple'
                      ? 'بنفسجي ملكي نيون'
                      : cardConfig.borderTheme === 'gold'
                      ? 'ذهبي مشع نيون'
                      : cardConfig.borderTheme === 'neonGreen'
                      ? 'أخضر فسفوري نيون'
                      : cardConfig.borderTheme === 'red'
                      ? 'أحمر ناري نيون'
                      : cardConfig.borderTheme === 'white'
                      ? 'أبيض كريستال ثلجي'
                      : cardConfig.borderTheme === 'custom'
                      ? 'لون إطار مخصص'
                      : 'بدون إطار (شفاف خالص)'}
                  </span>
                </div>

                {/* Preset Themes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {[
                    { id: 'tiktok', name: 'تيك توك نيون', gradient: 'from-[#00f2fe] to-[#fe2c55]' },
                    { id: 'cyan', name: 'سماوي سايبر', gradient: 'from-[#00f2fe] to-[#3b82f6]' },
                    { id: 'purple', name: 'بنفسجي ملكي', gradient: 'from-[#c084fc] to-[#ec4899]' },
                    { id: 'gold', name: 'ذهبي نيون', gradient: 'from-[#fbbf24] to-[#d97706]' },
                    { id: 'neonGreen', name: 'أخضر فسفوري', gradient: 'from-[#34d399] to-[#a3e635]' },
                    { id: 'red', name: 'أحمر ناري', gradient: 'from-[#ff4d4d] to-[#b91c1c]' },
                    { id: 'white', name: 'أبيض كريستال', gradient: 'from-[#ffffff] to-[#94a3b8]' },
                    { id: 'custom', name: '🎨 لون مخصص', gradient: 'from-pink-500 to-cyan-500' },
                    { id: 'transparent', name: 'بدون إطار (مفرغ)', gradient: 'from-slate-700 to-slate-800' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() =>
                        setCardConfig({
                          ...cardConfig,
                          borderTheme: theme.id as any,
                        })
                      }
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                        cardConfig.borderTheme === theme.id
                          ? 'bg-slate-800 text-white border-cyan-400 shadow-md ring-2 ring-cyan-400/40'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${theme.gradient} flex-shrink-0 shadow-sm`} />
                      <span className="truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Border Color & Border Width */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                  {/* Custom Border Color Picker */}
                  {cardConfig.borderTheme === 'custom' && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-rose-400" />
                        <span>اختر لون الإطار المخصص:</span>
                      </span>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={cardConfig.customBorderColor || '#00f2fe'}
                          onChange={(e) =>
                            setCardConfig({ ...cardConfig, customBorderColor: e.target.value })
                          }
                          className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono font-bold text-white">
                          {cardConfig.customBorderColor || '#00f2fe'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Border Width Slider */}
                  {cardConfig.borderTheme !== 'transparent' && (
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">سُمك وعرض إطار النيون:</span>
                        <span className="font-mono text-cyan-300 font-bold">
                          {cardConfig.borderWidth || 3.5}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        step="0.5"
                        value={cardConfig.borderWidth || 3.5}
                        onChange={(e) =>
                          setCardConfig({ ...cardConfig, borderWidth: Number(e.target.value) })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>1px (نحيف)</span>
                        <span>3.5px (افتراضي متوهج)</span>
                        <span>6px (عريض وقوي)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: CARD BACKGROUND COLOR & TRANSPARENCY (لون وشفافية خلفية البوكس) */}
              <div className="p-5 rounded-2xl bg-[#141724] border border-cyan-500/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <span className="text-sm font-black text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>لون وشفافية خلفية البوكس:</span>
                  </span>

                  {/* QUICK 1-CLICK PURE TRANSPARENT GLASS BUTTON */}
                  <button
                    onClick={() =>
                      setCardConfig({
                        ...cardConfig,
                        bgType: 'transparent',
                        bgOpacity: 0,
                        blurAmount: 16,
                      })
                    }
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/40 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-black transition-all cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>✨ تفعيل خلفية شفافة تماماً ببلور (بدون لون)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  {/* Background Color Picker & Quick Swatches */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">لون الخلفية المفضل:</span>
                      <span className="text-xs font-mono font-bold text-white">
                        {cardConfig.bgColor || '#000000'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={cardConfig.bgColor || '#000000'}
                        onChange={(e) =>
                          setCardConfig({
                            ...cardConfig,
                            bgColor: e.target.value,
                            bgType: 'solid',
                            bgOpacity: cardConfig.bgOpacity === 0 ? 80 : cardConfig.bgOpacity,
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs text-slate-400">
                        اختر أي لون تريده للخلفية، ثم تحكم في درجة شفافيته بالسلايدر.
                      </span>
                    </div>

                    {/* Quick Swatches */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { color: '#000000', name: 'أسود فاحم' },
                        { color: '#0f172a', name: 'رمادي داكن' },
                        { color: '#0b0f19', name: 'كحلي ليلي' },
                        { color: '#1a0f2e', name: 'بنفسجي داكن' },
                        { color: '#200b12', name: 'عنابي داكن' },
                      ].map((s) => (
                        <button
                          key={s.color}
                          onClick={() =>
                            setCardConfig({
                              ...cardConfig,
                              bgColor: s.color,
                              bgType: 'solid',
                              bgOpacity: cardConfig.bgOpacity === 0 ? 80 : cardConfig.bgOpacity,
                            })
                          }
                          title={s.name}
                          style={{ backgroundColor: s.color }}
                          className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                            cardConfig.bgColor === s.color
                              ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110'
                              : 'border-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Background Opacity Slider (من 0% شفاف خالص إلى 100% معتم) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">نسبة ظهور لون الخلفية (الشفافية):</span>
                      <span className="font-mono text-purple-300 font-bold">
                        {cardConfig.bgOpacity ?? 0}%
                        {(cardConfig.bgOpacity ?? 0) === 0 ? ' (شفاف خالص بدون لون)' : ''}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={cardConfig.bgOpacity ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCardConfig({
                          ...cardConfig,
                          bgOpacity: val,
                          bgType: val === 0 ? 'transparent' : 'solid',
                        });
                      }}
                      className="w-full accent-purple-400 cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span className="text-cyan-400">0% (شفافية كاملة)</span>
                      <span>50% (نصف شفاف)</span>
                      <span>100% (معتم تماماً)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BACKDROP BLUR (البلور الضبابي الزجاجي الشفاف) */}
              <div className="p-5 rounded-2xl bg-[#141724] border border-cyan-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>تأثير البلور الضبابي الزجاجي (Backdrop Blur):</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {cardConfig.blurAmount && cardConfig.blurAmount > 0
                      ? `${cardConfig.blurAmount}px بلور سينمائي`
                      : 'بدون بلور (0px)'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  يمنح البوكس مظهراً زجاجياً أنيقاً يغبّش كاميرا البث أو الفيديو خلفه مباشرةً بدون التأثير على وضوح نصوص الرسائل! يعمل مع الخلفية الشفافة وأيضاً مع الخلفيات الملونة.
                </p>

                {/* Quick Blur Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'بدون بلور (0px)', px: 0 },
                    { label: 'بلور ناعم (8px)', px: 8 },
                    { label: 'بلور سينمائي (16px)', px: 16 },
                    { label: 'بلور قوي جداً (28px)', px: 28 },
                  ].map((preset) => (
                    <button
                      key={preset.px}
                      onClick={() => setCardConfig({ ...cardConfig, blurAmount: preset.px })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        (cardConfig.blurAmount || 0) === preset.px
                          ? 'bg-cyan-500 text-black border-cyan-400 shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Blur Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">شريط درجة البلور الدقيقة (0px إلى 35px):</span>
                    <span className="font-mono text-cyan-300 font-bold">{cardConfig.blurAmount || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="35"
                    step="1"
                    value={cardConfig.blurAmount || 0}
                    onChange={(e) =>
                      setCardConfig({ ...cardConfig, blurAmount: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* SECTION 4: DIVIDER LINES CONTROLS (الخطان الفاصلان الأسودان) */}
              <div className="p-5 rounded-2xl bg-[#141724] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-sm font-black text-white flex items-center gap-2">
                    <Minus className="w-4 h-4 text-rose-400" />
                    <span>الخطان الفاصلان (أعلى وأسفل الرسالة):</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">إظهار الخطين:</span>
                    <input
                      type="checkbox"
                      checked={cardConfig.showDividers !== false}
                      onChange={(e) =>
                        setCardConfig({ ...cardConfig, showDividers: e.target.checked })
                      }
                      className="w-5 h-5 accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {/* Divider Color */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300">لون الخطين الفاصلين:</span>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={cardConfig.dividerColor || '#000000'}
                        onChange={(e) =>
                          setCardConfig({ ...cardConfig, dividerColor: e.target.value })
                        }
                        className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono font-bold text-white">
                        {cardConfig.dividerColor || '#000000'}
                      </span>
                    </div>

                    {/* Quick Swatches for Divider */}
                    <div className="flex gap-1.5 pt-1">
                      {[
                        { color: '#000000', name: 'أسود كلاسيكي' },
                        { color: '#334155', name: 'رمادي داكن' },
                        { color: '#ffffff', name: 'أبيض' },
                        { color: '#00f2fe', name: 'سماوي نيون' },
                        { color: '#fe2c55', name: 'وردي نيون' },
                      ].map((s) => (
                        <button
                          key={s.color}
                          onClick={() => setCardConfig({ ...cardConfig, dividerColor: s.color })}
                          title={s.name}
                          style={{ backgroundColor: s.color }}
                          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                            cardConfig.dividerColor === s.color
                              ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110'
                              : 'border-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Divider Thickness */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">سمك الخط (Thickness):</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {cardConfig.dividerThickness || 2}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.5"
                      value={cardConfig.dividerThickness || 2}
                      onChange={(e) =>
                        setCardConfig({ ...cardConfig, dividerThickness: Number(e.target.value) })
                      }
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>1px (نحيف)</span>
                      <span>2.5px (متوسط)</span>
                      <span>6px (عريض)</span>
                    </div>
                  </div>

                  {/* Divider Opacity */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">وضوح/شفافية الخط:</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {cardConfig.dividerOpacity ?? 85}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={cardConfig.dividerOpacity ?? 85}
                      onChange={(e) =>
                        setCardConfig({ ...cardConfig, dividerOpacity: Number(e.target.value) })
                      }
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: NOTIFICATION SOUND ALERTS (مؤثرات صوتية نيون) */}
              <div className="p-5 rounded-2xl bg-[#141724] border border-cyan-500/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-black text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                      <span>أصوات التنبيه النيون عند وصول رسالة جديدة (Notification SFX):</span>
                    </span>
                    <p className="text-xs text-slate-400">
                      يعمل الصوت تلقائياً داخل برنامج البث OBS / TikTok Live Studio وعند وصول رسائل جديدة لتنبيهك وتنبيه المشاهدين!
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">تشغيل الصوت:</span>
                    <input
                      type="checkbox"
                      checked={cardConfig.enableSoundAlert !== false}
                      onChange={(e) =>
                        setCardConfig({ ...cardConfig, enableSoundAlert: e.target.checked })
                      }
                      className="w-5 h-5 accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>

                {cardConfig.enableSoundAlert !== false && (
                  <div className="space-y-4 pt-1 animate-in fade-in">
                    {/* Sounds Selection Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {SOUND_PRESETS.map((preset) => (
                        <div
                          key={preset.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                            (cardConfig.soundTheme || 'tiktokDing') === preset.id
                              ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/40'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{preset.icon}</span>
                                <span>{preset.name}</span>
                              </span>
                              {(cardConfig.soundTheme || 'tiktokDing') === preset.id && (
                                <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-black text-[10px] font-black">
                                  مفعل
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {preset.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                            <button
                              type="button"
                              onClick={() => {
                                setCardConfig({ ...cardConfig, soundTheme: preset.id });
                                playSound(preset.id, cardConfig.soundVolume ?? 80);
                              }}
                              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                (cardConfig.soundTheme || 'tiktokDing') === preset.id
                                  ? 'bg-cyan-500 text-black font-black'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              <span>اختيار هذا الصوت</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => playSound(preset.id, cardConfig.soundVolume ?? 80)}
                              title="استمع للصوت للتجربة"
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-slate-700 hover:border-cyan-400 transition-all cursor-pointer flex items-center justify-center"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Volume Slider */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Volume2 className="w-4 h-4 text-cyan-400" />
                        <span>مستوى وقوة صوت التنبيه:</span>
                        <span className="font-mono text-cyan-300">{cardConfig.soundVolume ?? 80}%</span>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-64">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={cardConfig.soundVolume ?? 80}
                          onChange={(e) =>
                            setCardConfig({ ...cardConfig, soundVolume: Number(e.target.value) })
                          }
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => playSound(cardConfig.soundTheme || 'tiktokDing', cardConfig.soundVolume ?? 80)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                          🔊 تجربة
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: ENTRANCE ANIMATIONS (أنيميشن حركة ظهور الكارت) */}
              <div className="p-5 rounded-2xl bg-[#141724] border border-cyan-500/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-black text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-purple-400" />
                      <span>أنيميشن حركة ظهور الكارت على شاشة البث (Entrance Animation):</span>
                    </span>
                    <p className="text-xs text-slate-400">
                      تأثير حركي احترافي يظهر به الكارت في كل مرة تتغير فيها الرسالة على شاشة الـ Live!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewAnimKey((prev) => prev + 1);
                      if (cardConfig.enableSoundAlert !== false) {
                        playSound(cardConfig.soundTheme || 'tiktokDing', cardConfig.soundVolume ?? 80);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>🎬 تشغيل معاينة الحركة الآن</span>
                  </button>
                </div>

                {/* Animation Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      id: 'slideUp',
                      name: 'انزلاق ناعم من الأسفل',
                      desc: 'انزلاق سينمائي سلس ومرن يرتفع لأعلى بهدوء وأناقة',
                      icon: '⬆️',
                    },
                    {
                      id: 'neonGlitch',
                      name: 'وميض نيون واهتزاز خفيف',
                      desc: 'توهج نيون مبهج مع قفزة ارتدادية مرحة تيك توك ستايل',
                      icon: '⚡',
                    },
                    {
                      id: 'glassFade',
                      name: 'تلاشي زجاجي سينمائي',
                      desc: 'ظهور وتكبير هادئ من المركز مع تركيز ناعم ومموه',
                      icon: '🔍',
                    },
                    {
                      id: 'flip3d',
                      name: 'دوران ثلاثي الأبعاد 3D',
                      desc: 'دوران مجسم من المحور بزاوية ثلاثية الأبعاد مميزة',
                      icon: '🔄',
                    },
                  ].map((anim) => (
                    <button
                      type="button"
                      key={anim.id}
                      onClick={() => {
                        setCardConfig({ ...cardConfig, animationType: anim.id as any });
                        setPreviewAnimKey((prev) => prev + 1);
                      }}
                      className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        (cardConfig.animationType || 'slideUp') === anim.id
                          ? 'bg-gradient-to-br from-purple-950/40 to-slate-900 border-purple-400 shadow-lg shadow-purple-950/30 ring-1 ring-purple-400/40'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{anim.icon}</span>
                        {(cardConfig.animationType || 'slideUp') === anim.id && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-400 text-black text-[10px] font-black">
                            مفعل
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white">{anim.name}</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{anim.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: ANTI-BAN & PROFANITY FILTER (حماية البث من البان) */}
              <div className="p-5 rounded-2xl bg-[#141724] border border-rose-500/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-black text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-400" />
                      <span>نظام فلترة وحجب الشتائم التلقائي (Anti-Ban Protection):</span>
                    </span>
                    <p className="text-xs text-slate-400">
                      يحمي حسابك في تيك توك من الحظر (Live Ban) عبر التعرف التلقائي على الألفاظ البذيئة والشتائم وحجبها فوراً!
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">تفعيل الفلتر:</span>
                    <input
                      type="checkbox"
                      checked={cardConfig.enableProfanityFilter !== false}
                      onChange={(e) =>
                        setCardConfig({ ...cardConfig, enableProfanityFilter: e.target.checked })
                      }
                      className="w-5 h-5 accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                {cardConfig.enableProfanityFilter !== false && (
                  <div className="space-y-4 pt-1 animate-in fade-in">
                    {/* Action Mode Choice */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-300">طريقة التعامل مع الرسائل التي تحتوي على كلمات غير لائقة:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setCardConfig({ ...cardConfig, profanityAction: 'censor' })}
                          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-start gap-3 ${
                            (cardConfig.profanityAction || 'censor') === 'censor'
                              ? 'bg-rose-950/20 border-rose-400 ring-1 ring-rose-400/40'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-xl">✨</span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">استبدال الشتائم بنجوم (****)</span>
                              {(cardConfig.profanityAction || 'censor') === 'censor' && (
                                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                                  مختار
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              تصل الرسالة وتُعرض في البث ولكن يتم تشفير الكلمات المسيئة بنجوم لحماية المشاهدين واللايف.
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCardConfig({ ...cardConfig, profanityAction: 'block' })}
                          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-start gap-3 ${
                            cardConfig.profanityAction === 'block'
                              ? 'bg-rose-950/20 border-rose-400 ring-1 ring-rose-400/40'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-xl">🚫</span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">حجب ومنع إرسال الرسالة نهائياً</span>
                              {cardConfig.profanityAction === 'block' && (
                                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                                  مختار
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              يرفض السيرفر إرسال الرسالة ويظهر تنبيهاً للمرسل: "عذراً، الرسالة تحتوي على ألفاظ غير لائقة".
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Custom Blocked Words Input */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          إضافة كلمات مخصصة لقائمة الحظر (اختياري):
                        </span>
                        <span className="text-[11px] text-slate-500">افصل بين الكلمات بفواصل (، أو ,)</span>
                      </div>
                      <input
                        type="text"
                        value={cardConfig.customBlockedWords || ''}
                        onChange={(e) =>
                          setCardConfig({ ...cardConfig, customBlockedWords: e.target.value })
                        }
                        placeholder="مثال: كلمة1، كلمة2، كلمة3"
                        className="w-full bg-[#181a24] border border-slate-800 focus:border-rose-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: 30 EXCLUSIVE TITLE & NAME EFFECTS (30 تأثيراً خرافياً للاسم والتايتل) */}
              <div className="p-5 rounded-2xl bg-[#141724] border border-cyan-500/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-black text-white flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-cyan-400" />
                      <span>تأثيرات الاسم والتايتل الخرافية (30 تأثيراً احترافياً):</span>
                    </span>
                    <p className="text-xs text-slate-400">
                      اختر التأثير البصري المفضل لاسمك على كارت اللايف (يظهر فوراً في شاشة المعاينة بالأعلى وعلى الـ Overlay!)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">التأثير الحالي:</span>
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-black">
                      {getTitleEffect(cardConfig.titleEffect).nameAr}
                    </span>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {TITLE_EFFECT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTitleEffectCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        titleEffectCategory === cat.id
                          ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-950/50'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {cat.nameAr}
                    </button>
                  ))}
                </div>

                {/* 30 Effects Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {TITLE_EFFECTS.filter(
                    (eff) => titleEffectCategory === 'all' || eff.category === titleEffectCategory
                  ).map((eff) => {
                    const isSelected = (cardConfig.titleEffect || 'tiktokClassic') === eff.id;
                    const previewText =
                      cardConfig.cardHeaderName || currentUser?.displayName || 'A7MD';

                    return (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() => setCardConfig({ ...cardConfig, titleEffect: eff.id })}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2 relative group min-h-[105px] ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(0,242,254,0.3)] scale-[1.02]'
                            : 'bg-[#181a24]/90 border-slate-800 hover:border-slate-700 hover:bg-[#1b1f2e]'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px] font-black shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}

                        {/* Live Styled Text Sample */}
                        <div className="w-full py-1 flex items-center justify-center overflow-hidden">
                          <span
                            className={`text-lg uppercase tracking-wide truncate max-w-full ${eff.cssClass}`}
                          >
                            {previewText}
                          </span>
                        </div>

                        {/* Title and Category Info */}
                        <div className="w-full space-y-0.5 border-t border-slate-800/80 pt-1.5">
                          <p className="text-[11px] font-black text-white truncate max-w-full">
                            {eff.nameAr}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate max-w-full font-mono">
                            {eff.categoryAr}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: TEXT COLORS (ألوان النصوص) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Message Text Color */}
                <div className="p-4 rounded-2xl bg-[#141724] border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-cyan-400" />
                    <span>لون نص الرسالة الأساسي:</span>
                  </span>

                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={cardConfig.messageColor || '#ffffff'}
                      onChange={(e) => setCardConfig({ ...cardConfig, messageColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono font-bold text-white">
                      {cardConfig.messageColor || '#ffffff'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { color: '#ffffff', name: 'أبيض ناصع' },
                      { color: '#facc15', name: 'أصفر نيون' },
                      { color: '#4ade80', name: 'أخضر فسفوري' },
                      { color: '#38bdf8', name: 'سماوي نيون' },
                      { color: '#f472b6', name: 'وردي فاقع' },
                      { color: '#fb923c', name: 'برتقالي' },
                    ].map((swatch) => (
                      <button
                        key={swatch.color}
                        onClick={() => setCardConfig({ ...cardConfig, messageColor: swatch.color })}
                        title={swatch.name}
                        style={{ backgroundColor: swatch.color }}
                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                          cardConfig.messageColor === swatch.color ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110' : 'border-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. Streamer Name Color */}
                <div className="p-4 rounded-2xl bg-[#141724] border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-rose-400" />
                    <span>لون اسمك في الكارت:</span>
                  </span>

                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={cardConfig.nameColor || '#ffffff'}
                      onChange={(e) => setCardConfig({ ...cardConfig, nameColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono font-bold text-white">
                      {cardConfig.nameColor || '#ffffff'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { color: '#ffffff', name: 'أبيض' },
                      { color: '#00f2fe', name: 'سماوي تيك توك' },
                      { color: '#fe2c55', name: 'أحمر تيك توك' },
                      { color: '#c084fc', name: 'بنفسجي' },
                      { color: '#facc15', name: 'ذهبي' },
                    ].map((swatch) => (
                      <button
                        key={swatch.color}
                        onClick={() => setCardConfig({ ...cardConfig, nameColor: swatch.color })}
                        title={swatch.name}
                        style={{ backgroundColor: swatch.color }}
                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                          cardConfig.nameColor === swatch.color ? 'border-rose-400 ring-2 ring-rose-400/50 scale-110' : 'border-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Footer Color */}
                <div className="p-4 rounded-2xl bg-[#141724] border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>لون نص الفوتر (اللينك في البايو):</span>
                  </span>

                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={cardConfig.footerColor || '#67e8f9'}
                      onChange={(e) => setCardConfig({ ...cardConfig, footerColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono font-bold text-white">
                      {cardConfig.footerColor || '#67e8f9'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { color: '#67e8f9', name: 'سماوي' },
                      { color: '#94a3b8', name: 'رمادي هادئ' },
                      { color: '#f472b6', name: 'وردي' },
                      { color: '#a3e635', name: 'أخضر ليموني' },
                      { color: '#fde047', name: 'أصفر' },
                    ].map((swatch) => (
                      <button
                        key={swatch.color}
                        onClick={() => setCardConfig({ ...cardConfig, footerColor: swatch.color })}
                        title={swatch.name}
                        style={{ backgroundColor: swatch.color }}
                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                          cardConfig.footerColor === swatch.color ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110' : 'border-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 4: FONT SIZES & ALIGNMENT */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 border-t border-slate-800">
                {/* 1. Message Font Size & Alignment */}
                <div className="p-4 rounded-2xl bg-[#141724] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-cyan-400" />
                      <span>حجم خط نص الرسالة:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                      {cardConfig.messageFontSize || 26}px
                    </span>
                  </div>

                  <input
                    type="range"
                    min="14"
                    max="42"
                    step="1"
                    value={cardConfig.messageFontSize || 26}
                    onChange={(e) =>
                      setCardConfig({ ...cardConfig, messageFontSize: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />

                  <div className="flex items-center gap-1.5 pt-1">
                    {[
                      { label: 'صغير', size: 18 },
                      { label: 'متوسط', size: 24 },
                      { label: 'كبير', size: 30 },
                      { label: 'ضخم جداً', size: 38 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => setCardConfig({ ...cardConfig, messageFontSize: p.size })}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          cardConfig.messageFontSize === p.size
                            ? 'bg-cyan-500 text-black border-cyan-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300">محاذاة نص الرسالة:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCardConfig({ ...cardConfig, textAlign: 'right' })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border cursor-pointer ${
                          cardConfig.textAlign === 'right'
                            ? 'bg-cyan-500 text-black border-cyan-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                        <span>يمين</span>
                      </button>

                      <button
                        onClick={() => setCardConfig({ ...cardConfig, textAlign: 'center' })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border cursor-pointer ${
                          cardConfig.textAlign === 'center'
                            ? 'bg-cyan-500 text-black border-cyan-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                        <span>وسط</span>
                      </button>

                      <button
                        onClick={() => setCardConfig({ ...cardConfig, textAlign: 'left' })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border cursor-pointer ${
                          cardConfig.textAlign === 'left'
                            ? 'bg-cyan-500 text-black border-cyan-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                        <span>يسار</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Streamer Name Controls */}
                <div className="p-4 rounded-2xl bg-[#141724] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <User className="w-4 h-4 text-rose-400" />
                      <span>اسمك المعروض في الكارت:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">إظهار:</span>
                      <input
                        type="checkbox"
                        checked={cardConfig.showName !== false}
                        onChange={(e) =>
                          setCardConfig({ ...cardConfig, showName: e.target.checked })
                        }
                        className="w-4 h-4 accent-rose-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={cardConfig.cardHeaderName || ''}
                    onChange={(e) =>
                      setCardConfig({ ...cardConfig, cardHeaderName: e.target.value })
                    }
                    placeholder="اسمك في الكارت (مثال: A7MD)"
                    className="w-full bg-[#1b1f2e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 font-bold"
                  />

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">حجم خط الاسم:</span>
                      <span className="font-mono text-rose-300 font-bold">
                        {cardConfig.nameFontSize || 15}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="11"
                      max="28"
                      step="1"
                      value={cardConfig.nameFontSize || 15}
                      onChange={(e) =>
                        setCardConfig({ ...cardConfig, nameFontSize: Number(e.target.value) })
                      }
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-300">نص الشارة العلوية:</span>
                    <input
                      type="text"
                      value={cardConfig.badgeText || ''}
                      onChange={(e) =>
                        setCardConfig({ ...cardConfig, badgeText: e.target.value })
                      }
                      placeholder="رسالة مجهولة 💌"
                      className="w-full bg-[#1b1f2e] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                {/* 3. Avatar Picture & Footer Controls */}
                <div className="p-4 rounded-2xl bg-[#141724] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span>صورة البروفايل في الكارت:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">إظهار الصورة:</span>
                      <input
                        type="checkbox"
                        checked={cardConfig.showAvatar !== false}
                        onChange={(e) =>
                          setCardConfig({ ...cardConfig, showAvatar: e.target.checked })
                        }
                        className="w-4 h-4 accent-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">حجم دائرة الصورة:</span>
                      <span className="font-mono text-purple-300 font-bold">
                        {cardConfig.avatarSize || 28}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="52"
                      step="2"
                      value={cardConfig.avatarSize || 28}
                      onChange={(e) =>
                        setCardConfig({ ...cardConfig, avatarSize: Number(e.target.value) })
                      }
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">حجم خط الفوتر (اللينك في البايو):</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {cardConfig.footerFontSize || 12}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="9"
                      max="18"
                      step="1"
                      value={cardConfig.footerFontSize || 12}
                      onChange={(e) =>
                        setCardConfig({ ...cardConfig, footerFontSize: Number(e.target.value) })
                      }
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Big Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveCardCustomization}
                  disabled={savingCardConfig}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-cyan-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ جميع التعديلات والخطوط والبلور للايف والـ OBS</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MESSAGES INBOX */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            {/* Inbox Controls & Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0f1117] border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">تصفية:</span>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  الكل ({messages.length})
                </button>
                <button
                  onClick={() => setFilter('pinned')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filter === 'pinned'
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  المثبتة ({messages.filter((m) => m.isPinned).length})
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>تحديث تلقائي حي مفعل</span>
                </div>
              </div>
            </div>

            {/* Messages Grid */}
            {filteredMessages.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#0f1117] border border-slate-800/80 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">لا توجد رسائل واردة حالياً</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  انسخ رابطك وضعه في بايو التيك توك أو الاستوري ليقوم المتابعون بإرسال رسائل مجهولة لك فوراً!
                </p>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-lg cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>انسخ رابط البايو الخاص بك</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMessages.map((msg) => {
                  const isOnScreen = activeOverlayMsgId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`p-5 rounded-2xl bg-[#0f1117] border transition-all flex flex-col justify-between space-y-4 ${
                        isOnScreen
                          ? 'border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                          : 'border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      {/* Message Header */}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                            مجهول 💌
                          </span>
                          <span className="text-[11px] font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {isOnScreen && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            <span>معروض على شاشة اللايف</span>
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-white text-base font-semibold leading-relaxed text-right select-text flex-1">
                        {msg.content}
                      </p>

                      {/* Actions */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleSetOverlayMsg(isOnScreen ? null : msg.id)}
                          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isOnScreen
                              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isOnScreen ? 'إخفاء من اللايف' : 'عرض في اللايف الآن'}</span>
                        </button>

                        <button
                          onClick={() => handleTogglePin(msg)}
                          title={msg.isPinned ? 'إلغاء التثبيت' : 'تثبيت الرسالة'}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            msg.isPinned
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                        >
                          <Pin className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="حذف الرسالة"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE & LINK CUSTOMIZATION */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto w-full">
            <form
              onSubmit={handleSaveSettings}
              className="p-6 sm:p-8 rounded-3xl bg-[#0f1117] border border-slate-800/90 shadow-2xl space-y-6"
            >
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">تخصيص صفحة الرابط والكارت</h2>
                <p className="text-xs text-slate-400 mt-1">
                  عدل هنا جميع البيانات والنصوص التي تظهر للمتابعين في صفحة الإرسال وكارت اللايف.
                </p>
              </div>

              {/* Avatar Uploader */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300">الصورة الشخصية (تظهر داخل دائرة التيك توك):</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full tiktok-avatar-ring p-1 flex-shrink-0">
                    <img
                      src={formData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt="Avatar Preview"
                      className="w-full h-full rounded-full object-cover bg-slate-900"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-upload"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-all border border-slate-700"
                    >
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>اختر صورة من جهازك</span>
                    </label>
                    <p className="text-[11px] text-slate-500">أو يمكنك لصق رابط مباشر للصورة أدناه:</p>
                    <input
                      type="url"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full bg-[#181a22] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Big Title (with 3D preview) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  الاسم الكبير فوق الرابط (بتأثير الـ 3D التيك توك):
                </label>
                <input
                  type="text"
                  value={formData.bigTitle}
                  onChange={(e) => setFormData({ ...formData, bigTitle: e.target.value })}
                  placeholder="مثال: Ahmed Live"
                  className="w-full bg-[#181a22] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 font-bold"
                />
                <div className="p-3 rounded-xl bg-black/60 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    تأثير ({getTitleEffect(cardConfig.titleEffect).nameAr}):
                  </span>
                  <span
                    className={`text-2xl uppercase tracking-wide ${
                      getTitleEffect(cardConfig.titleEffect).cssClass
                    }`}
                  >
                    {formData.bigTitle || 'Live Stream'}
                  </span>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">اسم المستلم الصغير (إلى:):</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="مثال: أحمد"
                  className="w-full bg-[#181a22] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 font-bold"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">النص التعريفي للدعوة:</label>
                <textarea
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  rows={2}
                  className="w-full bg-[#181a22] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                ></textarea>
              </div>

              {/* Topic Title & Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">موضوع النقاش الآن 📌:</label>
                  <input
                    type="text"
                    value={formData.topicTitle}
                    onChange={(e) => setFormData({ ...formData, topicTitle: e.target.value })}
                    placeholder="مثال: مشاكل عاطفية"
                    className="w-full bg-[#181a22] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">تنبيه الموضوع:</label>
                  <input
                    type="text"
                    value={formData.topicNotice}
                    onChange={(e) => setFormData({ ...formData, topicNotice: e.target.value })}
                    placeholder="أي رسالة برا الموضوع مش هتظهر..."
                    className="w-full bg-[#181a22] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Live Badge toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#181a22] border border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">إظهار شارة • LIVE الحمراء</p>
                  <p className="text-[11px] text-slate-400">تظهر أسفل صورتك للإشارة إلى أنك في بث مباشر الآن</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isLive}
                  onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })}
                  className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold">
                  ✓ تم حفظ جميع التعديلات بنجاح!
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-rose-500 hover:opacity-90 text-white font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {savingSettings ? (
                  <span>جاري الحفظ...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>حفظ ونشر التعديلات</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
