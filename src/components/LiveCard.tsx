'use client';

import React from 'react';
import { AnonymousMessage, UserProfile, CardCustomization } from '@/lib/types';
import { MessageSquare } from 'lucide-react';
import { getTitleEffect } from '@/lib/titleEffects';

interface LiveCardProps {
  user: Partial<UserProfile>;
  message: AnonymousMessage | null;
  className?: string;
  showFooter?: boolean;
  customization?: CardCustomization;
}

function hexToRgba(hex: string, opacity: number = 100): string {
  if (!hex) return `rgba(0, 0, 0, ${opacity / 100})`;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0, 0, 0, ${opacity / 100})`;
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
    titleEffect: 'tiktokClassic',
    ...user.cardCustomization,
    ...customization,
  };

  const displayName =
    cardConfig.cardHeaderName?.trim() || user.bigTitle || user.displayName || 'Live Stream';
  const effectObj = getTitleEffect(cardConfig.titleEffect || 'tiktokClassic');

  // Determine border gradient and glow variables
  let borderGradient = 'linear-gradient(135deg, #00f2fe 0%, #d946ef 50%, #fe2c55 100%)';
  let borderGlow =
    'drop-shadow(0 0 10px rgba(0, 242, 254, 0.6)) drop-shadow(0 0 20px rgba(254, 44, 85, 0.4))';

  if (cardConfig.borderTheme === 'cyan') {
    borderGradient = 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 50%, #3b82f6 100%)';
    borderGlow = 'drop-shadow(0 0 12px rgba(0, 242, 254, 0.75))';
  } else if (cardConfig.borderTheme === 'purple') {
    borderGradient = 'linear-gradient(135deg, #c084fc 0%, #d946ef 50%, #ec4899 100%)';
    borderGlow = 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.75))';
  } else if (cardConfig.borderTheme === 'gold') {
    borderGradient = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)';
    borderGlow = 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.75))';
  } else if (cardConfig.borderTheme === 'neonGreen') {
    borderGradient = 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #a3e635 100%)';
    borderGlow = 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.75))';
  } else if (cardConfig.borderTheme === 'red') {
    borderGradient = 'linear-gradient(135deg, #ff4d4d 0%, #ef4444 50%, #b91c1c 100%)';
    borderGlow = 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.75))';
  } else if (cardConfig.borderTheme === 'white') {
    borderGradient = 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)';
    borderGlow = 'drop-shadow(0 0 14px rgba(255, 255, 255, 0.8))';
  } else if (cardConfig.borderTheme === 'custom' && cardConfig.customBorderColor) {
    const col = cardConfig.customBorderColor;
    borderGradient = `linear-gradient(135deg, ${col} 0%, #ffffff 50%, ${col} 100%)`;
    borderGlow = `drop-shadow(0 0 12px ${hexToRgba(col, 75)})`;
  } else if (cardConfig.borderTheme === 'transparent') {
    borderGradient = 'transparent';
    borderGlow = 'none';
  }

  const isTransparent = cardConfig.bgType === 'transparent' || (cardConfig.bgOpacity ?? 0) === 0;

  // Background color calculation
  let cardBg = 'transparent';
  if (!isTransparent) {
    cardBg = hexToRgba(cardConfig.bgColor || '#000000', cardConfig.bgOpacity ?? 90);
  } else if (cardConfig.blurAmount && cardConfig.blurAmount > 0) {
    // When 100% transparent but blur is desired:
    // A micro tint (0.02) triggers the GPU backdrop blur compositor cleanly in WebKit & Chromium
    // while remaining 99.9% transparent to the human eye!
    cardBg = 'rgba(0, 0, 0, 0.02)';
  }

  // Pure Transparent Blur: applies blur over camera behind it
  const cardBackdrop =
    cardConfig.blurAmount && cardConfig.blurAmount > 0
      ? `blur(${cardConfig.blurAmount}px)`
      : 'none';

  // Divider Line style (color, thickness & opacity)
  const dividerStyle: React.CSSProperties = {
    height: `${cardConfig.dividerThickness || 2}px`,
    backgroundColor: hexToRgba(
      cardConfig.dividerColor || '#000000',
      cardConfig.dividerOpacity ?? 85
    ),
    boxShadow:
      cardConfig.dividerColor === '#000000'
        ? '0 1px 3px rgba(0,0,0,0.5)'
        : `0 0 8px ${hexToRgba(cardConfig.dividerColor || '#000000', 50)}`,
  };

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
        className={`relative max-w-xl w-full mx-auto p-6 sm:p-7 text-center space-y-3 min-h-[190px] flex flex-col items-center justify-center transition-all ${className}`}
      >
        {/* Layer 1: Background & Backdrop Blur (Independent Layer - Zero mask interference) */}
        <div
          className="absolute inset-0 rounded-[1.5rem] pointer-events-none transition-all"
          style={{
            backgroundColor: cardBg,
            backdropFilter: cardBackdrop,
            WebkitBackdropFilter: cardBackdrop,
            border:
              cardConfig.blurAmount && cardConfig.blurAmount > 0
                ? '1px solid rgba(255, 255, 255, 0.12)'
                : 'none',
          }}
        />

        {/* Layer 2: Hollow Neon Border Frame */}
        {borderGradient !== 'transparent' && (
          <div
            className="absolute inset-0 rounded-[1.5rem] pointer-events-none transition-all"
            style={{
              padding: `${cardConfig.borderWidth || 3.5}px`,
              background: borderGradient,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              filter: borderGlow,
            }}
          />
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
      className={`relative max-w-xl w-full mx-auto p-5 sm:p-6 space-y-3 transition-all ${className}`}
    >
      {/* Layer 1: Background & Backdrop Blur (Independent Layer - Zero mask interference) */}
      <div
        className="absolute inset-0 rounded-[1.5rem] pointer-events-none transition-all"
        style={{
          backgroundColor: cardBg,
          backdropFilter: cardBackdrop,
          WebkitBackdropFilter: cardBackdrop,
          border:
            cardConfig.blurAmount && cardConfig.blurAmount > 0
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : 'none',
          boxShadow:
            cardConfig.blurAmount && cardConfig.blurAmount > 0
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.35)'
              : 'none',
        }}
      />

      {/* Layer 2: Hollow Neon Border Frame */}
      {borderGradient !== 'transparent' && (
        <div
          className="absolute inset-0 rounded-[1.5rem] pointer-events-none transition-all"
          style={{
            padding: `${cardConfig.borderWidth || 3.5}px`,
            background: borderGradient,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            filter: borderGlow,
          }}
        />
      )}

      {/* Layer 3: Card Content */}
      {/* 1. Card Header */}
      <div className="relative z-10 flex items-center justify-between pb-1">
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
                ...(cardConfig.nameColor && cardConfig.nameColor !== '#ffffff'
                  ? { color: cardConfig.nameColor }
                  : {}),
              }}
              className={`font-black tracking-wide transition-all uppercase ${effectObj.cssClass}`}
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

      {/* 2. Top Divider Line (الخط الفاصل العلوي) */}
      {cardConfig.showDividers !== false && (
        <div
          style={dividerStyle}
          className="relative z-10 w-full rounded-full transition-all"
        />
      )}

      {/* 3. Message Content */}
      <div className={`relative z-10 py-2.5 px-2 min-h-[65px] flex items-center ${alignClass}`}>
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

      {/* 4. Bottom Divider Line (الخط الفاصل السفلي) */}
      {cardConfig.showDividers !== false && showFooter && (
        <div
          style={dividerStyle}
          className="relative z-10 w-full rounded-full transition-all"
        />
      )}

      {/* 5. Card Footer - FULLY INSIDE THE BORDER */}
      {showFooter && (
        <div className="relative z-10 pt-1 flex items-center justify-between text-slate-400">
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
