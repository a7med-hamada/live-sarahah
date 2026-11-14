'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import LiveCard from '@/components/LiveCard';
import { AnonymousMessage, UserProfile } from '@/lib/types';
import { playSound } from '@/lib/sounds';

export default function OverlayPage() {
  const params = useParams();
  const username = (params?.username as string) || '';

  const [user, setUser] = useState<Partial<UserProfile>>({
    username,
    displayName: 'Live Stream',
    bigTitle: 'Live Stream',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    cardCustomization: {},
  });
  const [message, setMessage] = useState<AnonymousMessage | null>(null);
  const [animKey, setAnimKey] = useState<number>(0);

  useEffect(() => {
    // Force 100% transparent background on body and html for OBS and TikTok Live Studio
    document.documentElement.classList.add('transparent-overlay');
    document.body.classList.add('transparent-overlay');
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';

    let lastMsgId = '';
    let isFirstPoll = true;

    async function pollOverlay() {
      if (!username) return;
      try {
        const res = await fetch(`/api/overlay/${username}`);
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.user) {
            setUser(data.data.user);
          }
          const currentMsg = data.data.message;
          if (currentMsg) {
            if (currentMsg.id !== lastMsgId) {
              lastMsgId = currentMsg.id;
              setAnimKey((prev) => prev + 1);

              // Play Sound Alert (avoid loud sound on very initial page load)
              const cardCfg = data.data.user?.cardCustomization || {};
              if (!isFirstPoll && cardCfg.enableSoundAlert !== false) {
                playSound(cardCfg.soundTheme || 'tiktokDing', cardCfg.soundVolume ?? 80);
              }
            }
            setMessage(currentMsg);
          } else {
            setMessage(null);
          }
        }
      } catch (err) {
        console.error('Error polling overlay:', err);
      } finally {
        isFirstPoll = false;
      }
    }

    pollOverlay();
    const interval = setInterval(pollOverlay, 2000);

    return () => {
      clearInterval(interval);
      document.documentElement.classList.remove('transparent-overlay');
      document.body.classList.remove('transparent-overlay');
    };
  }, [username]);

  const animationClass = `anim-${user.cardCustomization?.animationType || 'slideUp'}`;

  return (
    <>
      {/* Force alpha transparency on HTML and BODY before any render */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              background: transparent !important;
              background-color: transparent !important;
              overflow: hidden !important;
            }
          `,
        }}
      />

      <main className="w-screen h-screen bg-transparent flex items-start justify-center p-4 sm:p-6 overflow-hidden">
        {/* OBS Studio / TikTok Live Studio 100% Transparent Viewport */}
        <div
          key={animKey}
          className={`w-full max-w-xl transition-all ${animationClass}`}
        >
          <LiveCard
            user={user}
            message={message}
            customization={user.cardCustomization}
          />
        </div>
      </main>
    </>
  );
}
