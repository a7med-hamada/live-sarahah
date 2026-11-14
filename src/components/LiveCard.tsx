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
    messageFontSize: 26,
    nameFontSize: 15,
    footerFontSize: 12,
    avatarSize: 28,
    showAvatar: true,
    showName: true,
    textAlign: 'right',
    badgeText: 'رسالة مجهولة 💌',
    bgType: 'transparent', // Default transparent as requested!
    bgColor: '#0f1117',
    bgOpacity: 0,
    messageColor: '#ffffff',
    nameColor: '#ffffff',
    footerColor: '#67e8f9',
    borderTheme: 'tiktok',
    ...user.cardCustomization,
    ...customization,
  };

  const displayName =
    cardConfig.cardHeaderName?.trim() || user.bigTitle || user.displayName || 'Live Stream';

  // Determine border colors
  let stop1 = '#00f2fe';
  let stop2 = '#d946ef';
  let stop3 = '#fe2c55';
  let glowColor1 = 'rgba(0, 242, 254, 0.6)';
  let glowColor2 = 'rgba(254, 44, 85, 0.4)';

  if (cardConfig.borderTheme === 'cyan') {
    stop1 = '#00f2fe';
    stop2 = '#38bdf8';
    stop3 = '#3b82f6';
    glowColor1 = 'rgba(0, 242, 254, 0.7)';
    glowColor2 = 'rgba(59, 130, 246, 0.5)';
  } else if (cardConfig.borderTheme === 'purple') {
    stop1 = '#c084fc';
    stop2 = '#d946ef';
    stop3 = '#ec4899';
    glowColor1 = 'rgba(192, 132, 252, 0.7)';
    glowColor2 = 'rgba(236, 72, 153, 0.5)';
  } else if (cardConfig.borderTheme === 'gold') {
    stop1 = '#fbbf24';
    stop2 = '#f59e0b';
    stop3 = '#d97706';
    glowColor1 = 'rgba(251, 191, 36, 0.7)';
    glowColor2 = 'rgba(217, 119, 6, 0.5)';
  } else if (cardConfig.borderTheme === 'neonGreen') {
    stop1 = '#34d399';
    stop2 = '#10b981';
    stop3 = '#a3e635';
    glowColor1 = 'rgba(52, 211, 153, 0.7)';
    glowColor2 = 'rgba(163, 230, 53, 0.5)';
  }

  const isTransparent = cardConfig.bgType === 'transparent' || cardConfig.bgOpacity === 0;

  // Determine fill for the card interior:
  let cardFill = 'transparent';
  let cardBackdrop = 'none';

  if (!isTransparent) {
    cardFill = hexToRgba(cardConfig.bgColor || '#0f1117', cardConfig.bgOpacity ?? 90);
    if ((cardConfig.bgOpacity ?? 90) < 90 && (cardConfig.bgOpacity ?? 90) > 0) {
      cardBackdrop = 'blur(10px)';
    }
  }

  // Unique gradient ID per card to avoid DOM collisions
  const gradId = `liveCardGrad_${user.username || 'def'}`;

  // Alignment classes
  const alignClass =
    cardConfig.textAlign === 'center'
      ? 'text-center justify-center'
      : cardConfig.textAlign === 'left'
      ? 'text-left justify-end'
      : 'text-right justify-start';

  if (!message) {
    return (
      <div
        id="live-card-element"
        style={{
          backgroundColor: cardFill,
          backdropFilter: cardBackdrop,
          WebkitBackdropFilter: cardBackdrop,
          borderRadius: '1.5rem',
        }}
        className={`relative max-w-xl w-full mx-auto p-6 sm:p-7 text-center space-y-3 min-h-[200px] flex flex-col items-center justify-center transition-all ${className}`}
      >
        {/* SVG Hollow Border (zero inside background!) */}
        {cardConfig.borderTheme !== 'transparent' && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id={`${gradId}_empty`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={stop1} />
                <stop offset="50%" stopColor={stop2} />
                <stop offset="100%" stopColor={stop3} />
              </linearGradient>
            </defs>
            <rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              rx="24"
              ry="24"
              fill="none"
              stroke={`url(#${gradId}_empty)`}
              strokeWidth="3.5"
              style={{
                filter: `drop-shadow(0 0 10px ${glowColor1}) drop-shadow(0 0 20px ${glowColor2})`,
              }}
            />
          </svg>
        )}

        <div className="relative z-10 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 mx-auto">
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
    <div
      id="live-card-element"
      style={{
        backgroundColor: cardFill,
        backdropFilter: cardBackdrop,
        WebkitBackdropFilter: cardBackdrop,
        borderRadius: '1.5rem',
      }}
      className={`relative max-w-xl w-full mx-auto p-5 sm:p-6 space-y-4 transition-all ${className}`}
    >
      {/* SVG Hollow Border: COMPLETELY HOLLOW INSIDE (fill="none") */}
      {cardConfig.borderTheme !== 'transparent' && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stop1} />
              <stop offset="50%" stopColor={stop2} />
              <stop offset="100%" stopColor={stop3} />
            </linearGradient>
          </defs>
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="24"
            ry="24"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="3.5"
            style={{
              filter: `drop-shadow(0 0 10px ${glowColor1}) drop-shadow(0 0 20px ${glowColor2})`,
            }}
          />
        </svg>
      )}

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
        {/* Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600/95 to-pink-600/95 text-white text-xs font-bold shadow-lg shadow-pink-950/60">
          <span>{cardConfig.badgeText || 'رسالة مجهولة 💌'}</span>
        </div>

        {/* User Brand & Avatar */}
        <div className="flex items-center gap-2">
          {cardConfig.showName && (
            <span
              style={{
                fontSize: `${cardConfig.nameFontSize || 15}px`,
                color: cardConfig.nameColor || '#ffffff',
                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
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
              className="rounded-full overflow-hidden border-2 border-cyan-400 shadow-md flex-shrink-0 transition-all bg-black/40"
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
      <div className={`relative z-10 py-3 px-2 min-h-[70px] flex items-center ${alignClass}`}>
        <p
          style={{
            fontSize: `${cardConfig.messageFontSize || 26}px`,
            color: cardConfig.messageColor || '#ffffff',
            textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 4px 20px rgba(0,0,0,0.9)',
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
        <div className="relative z-10 pt-2 border-t border-white/15 flex items-center justify-between text-slate-400">
          <div
            style={{
              fontSize: `${cardConfig.footerFontSize || 12}px`,
              color: cardConfig.footerColor || '#67e8f9',
              textShadow: '0 1px 6px rgba(0,0,0,0.9)',
            }}
            className="flex items-center gap-1.5 font-bold transition-all"
          >
            <span>ابعت رسالتك إنت كمان - اللينك في البايو</span>
            <span className="text-xs">🔗</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] text-slate-300 font-mono font-bold" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
              LIVE NOW
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
