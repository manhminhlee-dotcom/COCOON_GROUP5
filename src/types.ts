export const PALETTE = {
  bgBeige: '#FAF6F0',
  bgCard: '#FFFDF9',
  borderBeige: '#EFE6D5',
  borderDark: '#E5D9C5',
  coffee: '#3D2314',
  coffeeDark: '#2C1810',
  coffeeLight: '#4A2E1B',
  coffeeMuted: '#6B4C38',
  turmeric: '#E69F00',
  turmericLight: '#F5A623',
  turmericDark: '#D48800',
  turmericSoft: '#FEF3D6',
  lotus: '#D87093',
  lotusLight: '#E882A6',
  lotusDark: '#C2527A',
  lotusSoft: '#FDEBF1',
  tealActive: '#0D9488',
  darkRoom: '#120E0B',
};

export interface TeamMember {
  name: string;
  role: string;
  desc: string;
  avatar: string;
  studentId: string;
}

export interface QuarterInfo {
  quarter: string;
  year: string;
  newCustomers: number;
  highlight: string;
  churnRate: string;
  topChannel: string;
  topProduct: string;
  revenueEst: string;
  status: 'peak' | 'normal' | 'low';
  insight: string;
}

export interface DefenseQuestion {
  id: number;
  question: string;
  modelAnswer: string;
  keyPoints: string[];
}

export interface ChartItem {
  id: number;
  title: string;
  type: string;
  src: string;
}

export function playPageTurnSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, ctx.currentTime);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    whiteNoise.stop(ctx.currentTime + 0.14);
  } catch {
    // Audio context may require user interaction
  }
}
