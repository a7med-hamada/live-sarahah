'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import LiveCard from '@/components/LiveCard';
import { AnonymousMessage, UserProfile } from '@/lib/types';

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
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Force 100% transparent background on body and html for OBS and TikTok Live Studio
    document.documentElement.classList.add('transparent-overlay');
    document.body.classList.add('transparent-overlay');
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';

    let lastMsgId = '';

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
              setAnimating(true);
              setTimeout(() => setAnimating(false), 400);
            }
            setMessage(currentMsg);
          } else {
            setMessage(null);
          }
        }
      } catch (err) {
        console.error('Error polling overlay:', err);
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
          className={`w-full max-w-xl transition-all duration-300 transform ${
            animating ? 'scale-105 filter drop-shadow-[0_0_25px_#00f2fe]' : 'scale-100'
          }`}
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
