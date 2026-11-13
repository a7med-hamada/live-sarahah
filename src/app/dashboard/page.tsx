'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, AnonymousMessage } from '@/lib/types';
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
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

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
  const [filter, setFilter] = useState<'all' | 'unread' | 'pinned'>('all');
  const [showGuideModal, setShowGuideModal] = useState(false);

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
        // If no message is active, select the first available
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

    // Auto-refresh messages every 3 seconds to keep queue count accurate
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

  // Lock message firmly on stream
  const handleSetOverlayMsg = async (msgId: string | null) => {
    if (!currentUser) return;
    setActiveOverlayMsgId(msgId);
    setSkipOffset(0); // reset skip queue when user manually picks a message

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

  // Find the firmly locked active message
  const activeMsg = messages.find((m) => m.id === activeOverlayMsgId) || null;

  // Calculate messages received AFTER the currently displayed message
  // Messages are sorted newest to oldest. So newer messages have m.createdAt > activeMsg.createdAt
  const newerMessages = activeMsg
    ? messages.filter((m) => m.createdAt > activeMsg.createdAt).sort((a, b) => a.createdAt - b.createdAt) // oldest of the new messages first
    : [];

  const newerCount = newerMessages.length;

  // The "Next in Line" message taking skipOffset into account
  const nextInLineMsg = newerMessages.length > skipOffset ? newerMessages[skipOffset] : null;

  // Handle Skip (سكب)
  const handleSkipNext = () => {
    if (skipOffset + 1 < newerMessages.length) {
      setSkipOffset((prev) => prev + 1);
    } else {
      alert('لا توجد رسائل أخرى في الانتظار لتخطيها حالياً');
    }
  };

  // Handle Display Next (عرض الرسالة التالية في اللايف)
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
                  التحكم المباشر في كارت اللايف والرسائل الواردة
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  الرسالة المعروضة ثابتة ومقفولة على الشاشة، ولن تتغير تلقائياً إلا عندما تضغط على "الرسالة التالية" أو تختار رسالة أخرى بنفسك.
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

            {/* QUEUE STATUS BAR (عداد الرسائل الجديدة في الانتظار) */}
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

              {/* Status indicator */}
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-slate-300 font-bold">الكارت متصل بالبث المباشر</span>
              </div>
            </div>

            {/* NEXT MESSAGE PREVIEW & SKIP BOX (معاينة الرسالة التالية وزر السكب) */}
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

                    {/* Next Message Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        {/* Display Next on Live */}
                        <button
                          onClick={handleShowNextInLine}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-rose-500 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>عرض هذه الرسالة في اللايف الآن</span>
                        </button>

                        {/* SKIP BUTTON (زر السكب لتخطي هذه الرسالة ورؤية التي بعدها) */}
                        <button
                          onClick={handleSkipNext}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black text-xs transition-all cursor-pointer shadow-sm"
                          title="تخطي هذه الرسالة ومعاينة الرسالة التي بعدها"
                        >
                          <FastForward className="w-3.5 h-3.5" />
                          <span>سكب (تخطي للرسالة التي بعدها) ⏭️</span>
                        </button>
                      </div>

                      {/* Delete from queue */}
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
              {/* Simulated TikTok Live Header */}
              <div className="flex items-center justify-between text-xs text-white z-10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-cyan-400">
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

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-300">
                  <span>👥 975 مشاهد</span>
                </div>
              </div>

              {/* The Live Floating Card */}
              <div className="my-auto z-10 w-full flex justify-center py-4">
                <LiveCard
                  user={currentUser || { displayName: 'Streamer', bigTitle: 'Live Stream' }}
                  message={activeMsg}
                />
              </div>

              {/* Simulated Streamer / Video Camera Backdrop */}
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80"
                  alt="Streamer Camera Simulation"
                  className="w-full h-full object-cover opacity-35 filter brightness-75 contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70"></div>
              </div>

              {/* Simulated TikTok Live Bottom Chat */}
              <div className="z-10 flex items-center justify-between text-xs text-white pt-2">
                <div className="space-y-1">
                  <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-slate-300 text-[11px] inline-block">
                    💬 <span className="text-cyan-400 font-bold">متابع:</span> 😂😂😂😂
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-rose-500 text-lg">❤️</span>
                  <span className="text-rose-500 text-lg">❤️</span>
                </div>
              </div>
            </div>

            {/* Quick Cycle & Navigation Controls */}
            {messages.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const currentIdx = messages.findIndex((m) => m.id === activeOverlayMsgId);
                    const prevIdx = currentIdx < messages.length - 1 ? currentIdx + 1 : 0; // older message
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
                    const nextIdx = currentIdx > 0 ? currentIdx - 1 : messages.length - 1; // newer message
                    handleSetOverlayMsg(messages[nextIdx].id);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                >
                  <span>الرسالة الأحدث (التالية)</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
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
                  <span className="text-[11px] text-slate-400">معاينة التأثير:</span>
                  <span className="text-2xl tiktok-glitch uppercase tracking-wide">
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
