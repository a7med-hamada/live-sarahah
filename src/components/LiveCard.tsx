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

function hexToRgba(hex: string, opacity: number = 100): string {
  if (!hex) return `rgba(15, 17, 23, ${opacity / 100})`;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(15, 17, 23, ${opacity / 100})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(100, opacity)) / 100})`;
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
    messageFontSize: 24,
    nameFontSize: 15,
    footerFontSize: 12,
    avatarSize: 28,
    showAvatar: true,
    showName: true,
    textAlign: 'right',
    badgeText: 'رسالة مجهولة 💌',
    bgType: 'solid',
    bgColor: '#0f1117',
    bgOpacity: 95,
    messageColor: '#ffffff',
    nameColor: '#ffffff',
    footerColor: '#67e8f9',
    borderTheme: 'tiktok',
    ...user.cardCustomization,
    ...customization,
  };

  const displayName =
    cardConfig.cardHeaderName?.trim() || user.bigTitle || user.displayName || 'Live Stream';

  // Determine border gradient
  let borderGradient = 'linear-gradient(135deg, #00f2fe 0%, #d946ef 50%, #fe2c55 100%)';
  let borderShadow =
    '0 10px 40px -10px rgba(0, 242, 254, 0.35), 0 10px 40px -10px rgba(254, 44, 85, 0.35)';

  if (cardConfig.borderTheme === 'cyan') {
    borderGradient = 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)';
    borderShadow = '0 10px 40px -10px rgba(0, 242, 254, 0.4)';
  } else if (cardConfig.borderTheme === 'purple') {
    borderGradient = 'linear-gradient(135deg, #c084fc 0%, #ec4899 100%)';
    borderShadow = '0 10px 40px -10px rgba(236, 72, 153, 0.4)';
  } else if (cardConfig.borderTheme === 'gold') {
    borderGradient = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)';
    borderShadow = '0 10px 40px -10px rgba(245, 158, 11, 0.4)';
  } else if (cardConfig.borderTheme === 'neonGreen') {
    borderGradient = 'linear-gradient(135deg, #10b981 0%, #a3e635 100%)';
    borderShadow = '0 10px 40px -10px rgba(163, 230, 53, 0.4)';
  } else if (cardConfig.borderTheme === 'transparent') {
    borderGradient = 'transparent';
    borderShadow = 'none';
  }

  // Determine inner background
  let innerBackground = hexToRgba(cardConfig.bgColor || '#0f1117', cardConfig.bgOpacity ?? 95);
  let backdropFilter = cardConfig.bgOpacity !== undefined && cardConfig.bgOpacity < 90 && cardConfig.bgOpacity > 0 ? 'blur(12px)' : 'none';

  if (cardConfig.bgType === 'transparent' || cardConfig.bgOpacity === 0) {
    innerBackground = 'transparent';
    backdropFilter = 'none';
  }

  if (!message) {
    return (
      <div
        style={{
          background: borderGradient,
          boxShadow: borderShadow,
          borderRadius: '1.5rem',
          padding: '3px',
        }}
        className={`max-w-xl w-full mx-auto transition-all ${className}`}
      >
        <div
          style={{
            background: innerBackground,
            backdropFilter: backdropFilter,
            WebkitBackdropFilter: backdropFilter,
            borderRadius: 'calc(1.5rem - 3px)',
          }}
          className="flex flex-col items-center justify-center p-8 text-center space-y-3 min-h-[220px]"
        >
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
    <div
      id="live-card-element"
      style={{
        background: borderGradient,
        boxShadow: borderShadow,
        borderRadius: '1.5rem',
        padding: '3px',
      }}
      className={`max-w-xl w-full mx-auto shadow-2xl transition-all ${className}`}
    >
      <div
        style={{
          background: innerBackground,
          backdropFilter: backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          borderRadius: 'calc(1.5rem - 3px)',
        }}
        className="p-5 sm:p-6 space-y-4 transition-all"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
          {/* Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600/90 to-pink-600/90 text-white text-xs font-bold shadow-md shadow-pink-950/40">
            <span>{cardConfig.badgeText || 'رسالة مجهولة 💌'}</span>
          </div>

          {/* User Brand & Avatar */}
          <div className="flex items-center gap-2">
            {cardConfig.showName && (
              <span
                style={{
                  fontSize: `${cardConfig.nameFontSize || 15}px`,
                  color: cardConfig.nameColor || '#ffffff',
                }}
                className="font-extrabold tracking-wide transition-all"
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
            style={{
              fontSize: `${cardConfig.messageFontSize || 24}px`,
              color: cardConfig.messageColor || '#ffffff',
            }}
            className={`font-black leading-relaxed tracking-normal select-text w-full transition-all ${
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
          <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-slate-400">
            <div
              style={{
                fontSize: `${cardConfig.footerFontSize || 12}px`,
                color: cardConfig.footerColor || '#67e8f9',
              }}
              className="flex items-center gap-1.5 font-medium transition-all"
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
