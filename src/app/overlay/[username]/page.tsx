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
              setTimeout(() => setAnimating(false), 600);
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
    return () => clearInterval(interval);
  }, [username]);

  return (
    <div className="w-screen h-screen bg-transparent flex items-start justify-center p-6 overflow-hidden">
      {/* OBS Studio Transparent Canvas */}
      <div
        className={`w-full max-w-xl transition-all duration-500 transform ${
          animating ? 'scale-105 filter drop-shadow-[0_0_30px_#00f2fe]' : 'scale-100'
        }`}
      >
        <LiveCard
          user={user}
          message={message}
          customization={user.cardCustomization}
        />
      </div>
    </div>
  );
}
