import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook to play a synthetic shutter sound using Web Audio API
 * This avoids the need for an external file and ensures immediate playback
 */
export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on mount directly
    // Note: Some browsers require user interaction before AudioContext can start,
    // but we'll try to initialize it here or lazily on first play
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const playShutterSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
         const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
         if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
         } else {
             return;
         }
      }

      const ctx = audioContextRef.current;
      
      // Resume context if suspended (common browser policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const t = ctx.currentTime;

      // 1. Create White Noise Buffer for the "Click"
      const bufferSize = ctx.sampleRate * 0.1; // 0.1 seconds of noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      // 2. Create Noise Source
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // 3. Filter the noise to sound more like a mechanical shutter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, t); // Start muffled
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.1); // Quickly muffle more

      // 4. Create Gain Node for Envelope (Volume shape)
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.01); // Attack
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); // Decay

      // Connect graph: Noise -> Filter -> Gain -> Destination
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      // Play
      noise.start(t);
      noise.stop(t + 0.15);

    } catch (e) {
      console.error("Failed to play shutter sound", e);
    }
  }, []);

  return { playShutterSound };
}
