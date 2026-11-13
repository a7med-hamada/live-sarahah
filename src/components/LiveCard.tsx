'use client';

import React from 'react';
import { AnonymousMessage, UserProfile } from '@/lib/types';
import { MessageSquare, Sparkles, Pin } from 'lucide-react';

interface LiveCardProps {
  user: Partial<UserProfile>;
  message: AnonymousMessage | null;
  className?: string;
  showFooter?: boolean;
}

export default function LiveCard({
  user,
  message,
  className = '',
  showFooter = true,
}: LiveCardProps) {
  if (!message) {
    return (
      <div className={`live-neon-card max-w-lg w-full mx-auto ${className}`}>
        <div className="live-neon-inner flex flex-col items-center justify-center p-8 text-center space-y-3 min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-base font-bold text-white">في انتظار الرسائل الجديدة...</p>
          <p className="text-xs text-slate-400">
            شارك رابطك في البايو أو الاستوري وستظهر رسائل المتابعين هنا مباشرة أثناء اللايف!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="live-card-element" className={`live-neon-card max-w-xl w-full mx-auto shadow-2xl ${className}`}>
      <div className="live-neon-inner space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          {/* Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600/90 to-pink-600/90 text-white text-xs font-bold shadow-md shadow-pink-950/40">
            <span>رسالة مجهولة</span>
            <span className="text-sm">💌</span>
          </div>

          {/* User Brand */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white tracking-wide">
              {user.bigTitle || user.displayName || 'Nexon Live'}
            </span>
            <div className="w-6 h-6 rounded-full overflow-hidden border border-cyan-400/80 shadow-sm">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user.displayName || 'Avatar'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="py-2 px-1">
          <p className="text-[17px] sm:text-[19px] font-bold text-white leading-relaxed tracking-normal text-right select-text">
            {message.content}
          </p>
        </div>

        {/* Card Footer */}
        {showFooter && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <span>ابعت رسالتك إنت كمان - اللينك في البايو</span>
              <span className="text-xs">🔗</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] text-slate-400 font-mono">LIVE NOW</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
