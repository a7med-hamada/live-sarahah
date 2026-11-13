'use client';

import React from 'react';
import { AnonymousMessage, UserProfile, CardCustomization } from '@/lib/types';
import { MessageSquare } from 'lucide-react';

interface LiveCardProps {
  user: Partial<UserProfile>;
  message: AnonymousMessage | null;
  className?: string;
  showFooter?: boolean;
  customization?: CardCustomization;
}

export default function LiveCard({
  user,
  message,
  className = '',
  showFooter = true,
  customization,
}: LiveCardProps) {
  // Merge profile customization with passed props
  const cardConfig: CardCustomization = {
    messageFontSize: 20,
    nameFontSize: 14,
    footerFontSize: 12,
    avatarSize: 28,
    showAvatar: true,
    showName: true,
    textAlign: 'right',
    badgeText: 'رسالة مجهولة 💌',
    ...user.cardCustomization,
    ...customization,
  };

  const displayName = cardConfig.cardHeaderName?.trim() || user.bigTitle || user.displayName || 'Live Stream';

  if (!message) {
    return (
      <div className={`live-neon-card max-w-xl w-full mx-auto ${className}`}>
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

  // Determine text alignment class
  const alignClass =
    cardConfig.textAlign === 'center'
      ? 'text-center justify-center'
      : cardConfig.textAlign === 'left'
      ? 'text-left justify-end'
      : 'text-right justify-start';

  return (
    <div id="live-card-element" className={`live-neon-card max-w-xl w-full mx-auto shadow-2xl ${className}`}>
      <div className="live-neon-inner space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          {/* Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600/90 to-pink-600/90 text-white text-xs font-bold shadow-md shadow-pink-950/40">
            <span>{cardConfig.badgeText || 'رسالة مجهولة 💌'}</span>
          </div>

          {/* User Brand & Avatar */}
          <div className="flex items-center gap-2">
            {cardConfig.showName && (
              <span
                style={{ fontSize: `${cardConfig.nameFontSize || 14}px` }}
                className="font-extrabold text-white tracking-wide transition-all"
              >
                {displayName}
              </span>
            )}

            {cardConfig.showAvatar && (
              <div
                style={{
                  width: `${cardConfig.avatarSize || 28}px`,
                  height: `${cardConfig.avatarSize || 28}px`,
                }}
                className="rounded-full overflow-hidden border border-cyan-400/80 shadow-sm flex-shrink-0 transition-all"
              >
                <img
                  src={
                    user.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`py-3 px-2 min-h-[70px] flex items-center ${alignClass}`}>
          <p
            style={{ fontSize: `${cardConfig.messageFontSize || 20}px` }}
            className={`font-black text-white leading-relaxed tracking-normal select-text w-full transition-all ${
              cardConfig.textAlign === 'center'
                ? 'text-center'
                : cardConfig.textAlign === 'left'
                ? 'text-left'
                : 'text-right'
            }`}
          >
            {message.content}
          </p>
        </div>

        {/* Card Footer */}
        {showFooter && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
            <div
              style={{ fontSize: `${cardConfig.footerFontSize || 12}px` }}
              className="flex items-center gap-1.5 text-cyan-300 font-medium transition-all"
            >
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
