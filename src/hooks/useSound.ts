import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook to play a synthetic shutter sound using Web Audio API
 * This avoids the need for an external file and ensures immediate playback
 */
export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    // Initialize AudioContext and preload sound
    const initAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass && !audioContextRef.current) {
          audioContextRef.current = new AudioContextClass();
        }

        if (audioContextRef.current) {
            const response = await fetch('/vrchat-camera.mp3');
            const arrayBuffer = await response.arrayBuffer();
            const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            audioBufferRef.current = decodedBuffer;
        }
      } catch (e) {
        console.error("Failed to init audio or load sound", e);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const playShutterSound = useCallback(() => {
    try {
      const ctx = audioContextRef.current;
      const buffer = audioBufferRef.current;

      if (!ctx || !buffer) return;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

    } catch (e) {
      console.error("Failed to play shutter sound", e);
    }
  }, []);

  return { playShutterSound };
}
