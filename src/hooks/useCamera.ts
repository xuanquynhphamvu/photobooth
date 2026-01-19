'use client';

import { useState, useCallback } from 'react';

interface UseCameraReturn {
  stream: MediaStream | null;
  error: Error | null;
  isLoading: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Camera API not available. This is likely because you are accessing the app over HTTP instead of HTTPS. ' +
          'On mobile devices, camera access requires a secure context (HTTPS) or localhost.'
        );
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to access camera'));
      setStream(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  return { stream, error, isLoading, startCamera, stopCamera };
}
