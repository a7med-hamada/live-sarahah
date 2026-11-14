/**
 * Web Audio API Sound Synthesizer
 * Generates zero-latency, high-fidelity notification sound effects
 * entirely client-side without any external MP3 files or CDN dependencies.
 */

export type SoundTheme =
  | 'tiktokDing'
  | 'neonPop'
  | 'sparkleChime'
  | 'cyberpunkPulse'
  | 'smoothSwoosh';

export const SOUND_PRESETS: { id: SoundTheme; name: string; description: string; icon: string }[] = [
  {
    id: 'tiktokDing',
    name: 'رنة تيك توك الشهيرة (Ding Bell)',
    description: 'نغمة جرس ناعمة ومبهجة مستوحاة من تنبيهات التيك توك',
    icon: '🔔',
  },
  {
    id: 'neonPop',
    name: 'بوب نيون مرح (Bubble Pop)',
    description: 'صوت فقاعة نيون لطيف وسريع وممتع للأذن',
    icon: '🫧',
  },
  {
    id: 'sparkleChime',
    name: 'تشايم كريستالي ساحر (Magic Chime)',
    description: 'نغمات متصاعدة لامعة تجذب انتباه المتابعين فوراً',
    icon: '✨',
  },
  {
    id: 'cyberpunkPulse',
    name: 'تنبيه سايبر بانك مستقبلي (Cyber Pulse)',
    description: 'نبضة سينث عصرية تناسب بثوث الجيمنج والنيون',
    icon: '⚡',
  },
  {
    id: 'smoothSwoosh',
    name: 'سووش ناعم وسريع (Modern Swoosh)',
    description: 'صوت انسيابي خافت وغير مزعج للبثوث الهادئة',
    icon: '💨',
  },
];

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSound(theme: SoundTheme | string = 'tiktokDing', volumePercent: number = 80): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseVol = Math.max(0, Math.min(100, volumePercent)) / 100;
  const now = ctx.currentTime;

  switch (theme) {
    case 'tiktokDing': {
      // 2-tone melodic harmonic bell (E6 -> G#6)
      const notes = [
        { freq: 1318.51, start: 0, dur: 0.45 },
        { freq: 1661.22, start: 0.08, dur: 0.65 },
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.start);

        gain.gain.setValueAtTime(0, now + n.start);
        gain.gain.linearRampToValueAtTime(0.35 * baseVol, now + n.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.start);
        osc.stop(now + n.start + n.dur);
      });
      break;
    }

    case 'neonPop': {
      // Juicy frequency drop bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

      gain.gain.setValueAtTime(0.4 * baseVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
      break;
    }

    case 'sparkleChime': {
      // Magical 4-note ascending sparkle chord
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
      freqs.forEach((freq, idx) => {
        const startTime = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25 * baseVol, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
      break;
    }

    case 'cyberpunkPulse': {
      // Futuristic synth blip with resonant harmonics
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);

      gain.gain.setValueAtTime(0.25 * baseVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
      break;
    }

    case 'smoothSwoosh':
    default: {
      // Filtered noise swoosh simulation using rapid sine sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3 * baseVol, now + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
  }
}
