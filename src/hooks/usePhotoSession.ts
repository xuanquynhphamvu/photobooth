'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSound } from './useSound';

export type SessionStatus = 'idle' | 'getting-ready' | 'countdown' | 'capturing' | 'layout-selection' | 'review';

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

const PHOTOS_PER_SESSION = 4;
const COUNTDOWN_SECONDS = 3;
const GET_READY_SECONDS = 1;

export function usePhotoSession({ captureFn, onFinish }: UsePhotoSessionProps = {}): UsePhotoSessionReturn {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(0);
  const photosCountRef = useRef(0);
  const isSessionActiveRef = useRef(false);
  const isCapturingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { playShutterSound } = useSound();
  
  const clearTimer = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
  };

  const capturePhoto = useCallback(async () => {
    if (captureFn && isSessionActiveRef.current && !isCapturingRef.current) {
        isCapturingRef.current = true;
        setStatus('capturing');
        playShutterSound();
        try {
            // Capture immediately to sync with countdown end & flash start
            let photoResult: string | Blob | null = null;
            if (isSessionActiveRef.current) {
                photoResult = await captureFn();
            }
            
            // Wait for flash animation (500ms) before proceeding
            // This ensures the flash is visible and gives a consistent "shutter speed" feel
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (!isSessionActiveRef.current) {
                isCapturingRef.current = false;
                return;
            }
            
            if (photoResult) {
                const photoUrl = typeof photoResult === 'string' ? photoResult : URL.createObjectURL(photoResult);
                setPhotos(prev => [...prev, photoUrl]);
                photosCountRef.current += 1;
            }
        } catch (e) {
            console.error("Capture failed", e);
        } finally {
            isCapturingRef.current = false;
        }
    }
  }, [captureFn, playShutterSound]);

  const startCountdown = useCallback(() => {
     if (!isSessionActiveRef.current) return;
     setStatus('countdown');
     setCountdown(COUNTDOWN_SECONDS);
  }, []);

  const startGetReady = useCallback(() => {
    if (!isSessionActiveRef.current) return;
    setStatus('getting-ready');
    clearTimer();
    timerRef.current = setTimeout(() => {
        if (isSessionActiveRef.current) {
            startCountdown();
        }
    }, GET_READY_SECONDS * 1000);
  }, [startCountdown]);

  const startSession = useCallback(() => {
    isSessionActiveRef.current = true;
    setPhotos([]);
    photosCountRef.current = 0;
    startGetReady();
  }, [startGetReady]);

  const resetSession = useCallback(() => {
    isSessionActiveRef.current = false;
    clearTimer();
    setStatus('idle');
    setPhotos([]);
    setCountdown(0);
    photosCountRef.current = 0;
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
        isSessionActiveRef.current = false;
        clearTimer();
    };
  }, []);

  useEffect(() => {
    let intervalTimer: NodeJS.Timeout;

    if (status === 'countdown' && isSessionActiveRef.current) {
        if (countdown > 0) {
            intervalTimer = setTimeout(() => {
                if (isSessionActiveRef.current) {
                    setCountdown(prev => prev - 1);
                }
            }, 1000);
        } else {
            // Countdown finished, capture!
            const performCaptureSequence = async () => {
                await capturePhoto();
                
                if (isSessionActiveRef.current) {
                    if (photosCountRef.current < PHOTOS_PER_SESSION) {
                        startGetReady();
                    } else {
                        setStatus('layout-selection');
                        onFinish?.(photos);
                    }
                }
            };
            performCaptureSequence();
        }
    }

    return () => clearTimeout(intervalTimer);
  }, [status, countdown, capturePhoto, startGetReady, onFinish, photos]);

  return { status, photos, setPhotos, countdown, startSession, resetSession };
}
