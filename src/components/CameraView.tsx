import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { CountdownOverlay } from "./CountdownOverlay";
import { FlashEffect } from "./FlashEffect";

export interface CameraViewHandle {
  capture: () => Promise<string | null>;
}

interface CameraViewProps {
  stream: MediaStream | null;
  error: Error | null;
  isLoading?: boolean;
  onClose: () => void;
  countdown?: number;
  isCapturing?: boolean;
  onStartSession?: () => void;
}

export const CameraView = forwardRef<CameraViewHandle, CameraViewProps>(
  ({ stream, error, isLoading, onClose, countdown = 0, isCapturing = false, onStartSession }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        if (!videoRef.current) return null;
        
        const video = videoRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.warn("CameraView: Video dimensions are 0");
            return null;
        }

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        
        // Apply B&W filter
        ctx.filter = "grayscale(1) contrast(1.1)";
        
        // Flip horizontally to match mirrored video
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        
        ctx.drawImage(video, 0, 0);
        
        return canvas.toDataURL("image/jpeg");
      },
    }));

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !isCapturing && countdown === 0 && stream && !isLoading) {
          e.preventDefault();
          onStartSession?.();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCapturing, countdown, stream, isLoading, onStartSession]);

    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("CameraView: Auto-play failed", e));
      }
    }, [stream]);

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-8 text-center bg-stone-50 rounded-lg border-2 border-stone-200">
          <div className="space-y-2">
            <h3 className="text-2xl font-serif text-stone-900">Camera Access Error</h3>
            <p className="text-stone-600">{error.message}</p>
            <p className="text-sm text-stone-500">Please ensure you have allowed camera access in your browser settings.</p>
          </div>
          <Button onClick={onClose} variant="outline" className="font-serif">
            Back to Start
          </Button>
        </div>
      );
    }

    return (
      <div className="relative w-full max-w-4xl mx-auto bg-[#745e59] rounded-lg overflow-hidden shadow-2xl aspect-video group">
        {(!stream || isLoading) && (
          <div className="absolute inset-0 flex items-center justify-center text-white/50 font-serif">
            {isLoading ? "Requesting camera access..." : "Waiting for camera..."}
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100 filter-bw"
        />

        <CountdownOverlay count={countdown} />
        <FlashEffect trigger={isCapturing} />

        {/* Controls Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
           <div className="flex justify-end pointer-events-auto">
             <Button 
                onClick={onClose}
                variant="ghost" 
                className="text-white hover:bg-white/20 hover:text-white rounded-full bg-[#745e59]/20 backdrop-blur-sm h-12 w-12 p-0"
              >
                ✕
              </Button>
           </div>
           
           <div className="flex justify-center pointer-events-auto">
             {stream && !isLoading && !isCapturing && countdown === 0 && (
                 <Button
                    onClick={onStartSession}
                    size="lg"
                    className="font-serif text-lg px-8 py-6 rounded-full bg-white text-[#745e59] hover:bg-stone-200 shadow-xl"
                 >
                    Take Photos
                 </Button>
             )}
           </div>
        </div>
      </div>
    );
  }
);

CameraView.displayName = "CameraView";
