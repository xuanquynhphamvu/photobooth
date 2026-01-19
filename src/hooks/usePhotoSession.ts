'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type SessionStatus = 'idle' | 'countdown' | 'capturing' | 'layout-selection' | 'review';

interface UsePhotoSessionProps {
  captureFn?: () => Promise<string | Blob | null>;
  onFinish?: (photos: string[]) => void;
}

interface UsePhotoSessionReturn {
  status: SessionStatus;
  photos: string[];
  setPhotos: (photos: string[]) => void;
  countdown: number;
  startSession: () => void;
  resetSession: () => void;
}

const PHOTOS_PER_SESSION = 6;
const COUNTDOWN_SECONDS = 3;

export function usePhotoSession({ captureFn, onFinish }: UsePhotoSessionProps = {}): UsePhotoSessionReturn {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(0);
  const photosCountRef = useRef(0);
  
  const capturePhoto = useCallback(async () => {
    if (captureFn) {
        setStatus('capturing');
        try {
            const photo = await captureFn();
            if (photo) {
                const photoUrl = typeof photo === 'string' ? photo : URL.createObjectURL(photo);
                setPhotos(prev => [...prev, photoUrl]);
                photosCountRef.current += 1;
            }
        } catch (e) {
            console.error("Capture failed", e);
        }
    }
  }, [captureFn]);

  const startCountdown = useCallback(() => {
     setStatus('countdown');
     setCountdown(COUNTDOWN_SECONDS);
  }, []);

  const startSession = useCallback(() => {
    setPhotos([]);
    photosCountRef.current = 0;
    startCountdown();
  }, [startCountdown]);

  const resetSession = useCallback(() => {
    setStatus('idle');
    setPhotos([]);
    setCountdown(0);
    photosCountRef.current = 0;
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (status === 'countdown') {
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else {
            // Countdown finished, capture!
            const performCaptureSequence = async () => {
                await capturePhoto();
                
                if (photosCountRef.current < PHOTOS_PER_SESSION) {
                    startCountdown();
                } else {
                    setStatus('layout-selection');
                    onFinish?.(photos);
                }
            };
            performCaptureSequence();
        }
    }

    return () => clearTimeout(timer);
  }, [status, countdown, capturePhoto, startCountdown, onFinish, photos]);

  return { status, photos, setPhotos, countdown, startSession, resetSession };
}
