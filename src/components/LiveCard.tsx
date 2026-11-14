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
    bgType: 'transparent',
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

  // Determine border gradient and glow variables
  let borderGradient = 'linear-gradient(135deg, #00f2fe 0%, #d946ef 50%, #fe2c55 100%)';
  let borderGlow =
    'drop-shadow(0 0 10px rgba(0, 242, 254, 0.6)) drop-shadow(0 0 20px rgba(254, 44, 85, 0.4))';

  if (cardConfig.borderTheme === 'cyan') {
    borderGradient = 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 50%, #3b82f6 100%)';
    borderGlow = 'drop-shadow(0 0 12px rgba(0, 242, 254, 0.7))';
  } else if (cardConfig.borderTheme === 'purple') {
    borderGradient = 'linear-gradient(135deg, #c084fc 0%, #d946ef 50%, #ec4899 100%)';
    borderGlow = 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.7))';
  } else if (cardConfig.borderTheme === 'gold') {
    borderGradient = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)';
    borderGlow = 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.7))';
  } else if (cardConfig.borderTheme === 'neonGreen') {
    borderGradient = 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #a3e635 100%)';
    borderGlow = 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.7))';
  } else if (cardConfig.borderTheme === 'transparent') {
    borderGradient = 'transparent';
    borderGlow = 'none';
  }

  const isTransparent = cardConfig.bgType === 'transparent' || cardConfig.bgOpacity === 0;

  // Determine inner background
  let cardBg = 'transparent';
  let cardBackdrop = 'none';

  if (!isTransparent) {
    cardBg = hexToRgba(cardConfig.bgColor || '#0f1117', cardConfig.bgOpacity ?? 90);
    if ((cardConfig.bgOpacity ?? 90) < 90 && (cardConfig.bgOpacity ?? 90) > 0) {
      cardBackdrop = 'blur(10px)';
    }
  }

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
        style={
          {
            backgroundColor: cardBg,
            backdropFilter: cardBackdrop,
            WebkitBackdropFilter: cardBackdrop,
            '--border-gradient': borderGradient,
            '--border-glow': borderGlow,
          } as React.CSSProperties
        }
        className={`neon-hollow-border max-w-xl w-full mx-auto p-6 sm:p-7 text-center space-y-3 min-h-[190px] flex flex-col items-center justify-center transition-all ${className}`}
      >
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
      style={
        {
          backgroundColor: cardBg,
          backdropFilter: cardBackdrop,
          WebkitBackdropFilter: cardBackdrop,
          '--border-gradient': borderGradient,
          '--border-glow': borderGlow,
        } as React.CSSProperties
      }
      className={`neon-hollow-border max-w-xl w-full mx-auto p-5 sm:p-6 space-y-4 transition-all ${className}`}
    >
      {/* 1. Card Header */}
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
                textShadow: '0 2px 8px rgba(0,0,0,0.95)',
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

      {/* 2. Message Content */}
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

      {/* 3. Card Footer - FULLY INSIDE THE BORDER */}
      {showFooter && (
        <div className="relative z-10 pt-2 border-t border-white/15 flex items-center justify-between text-slate-400">
          <div
            style={{
              fontSize: `${cardConfig.footerFontSize || 12}px`,
              color: cardConfig.footerColor || '#67e8f9',
              textShadow: '0 1px 6px rgba(0,0,0,0.95)',
            }}
            className="flex items-center gap-1.5 font-bold transition-all"
          >
            <span>ابعت رسالتك إنت كمان - اللينك في البايو</span>
            <span className="text-xs">🔗</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span
              className="text-[10px] text-slate-300 font-mono font-bold"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.95)' }}
            >
              LIVE NOW
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
