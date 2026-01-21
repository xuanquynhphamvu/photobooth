import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { type SessionStatus } from "@/hooks/usePhotoSession";
import { Button } from "@/components/ui/button";
import { CountdownOverlay } from "./CountdownOverlay";
import { FlashEffect } from "./FlashEffect";
import { useOrientation } from "@/hooks/useOrientation";
import { cn } from "@/lib/utils";

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
  photosTaken?: number;
  status?: SessionStatus;
}

export const CameraView = forwardRef<CameraViewHandle, CameraViewProps>(
  ({ stream, error, isLoading, onClose, countdown = 0, isCapturing = false, onStartSession, photosTaken = 0, status }, ref) => {
    const { isPortrait } = useOrientation();
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
        
        // Capture at the video's native resolution, but respecting the aspect ratio crop if needed
        // For simplicity, we just capture the video frame as is.
        // However, we want to ensure the OUTPUT image matches our configured aspect ratio.
        
        // Let's grab the dimensions from our config based on orientation
        // const targetDim = LAYOUT_CONFIG.getDimensions(isPortrait); 
        // actually, we just want to leverage the video stream.
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        
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
        <div className="flex flex-col items-center justify-center min-h-[60dvh] space-y-6 p-8 text-center bg-stone-50 rounded-lg border-2 border-stone-200">
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
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 px-4">
        {/* Dynamic Aspect Ratio Container */}
        <div 
            className={cn(
                "relative w-full bg-[#745e59] rounded-lg overflow-hidden shadow-2xl group mx-auto transition-all duration-500",
                isPortrait ? "aspect-[3/4] max-w-[500px]" : "aspect-video"
            )}
        >
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
            className="w-full h-full object-cover transform -scale-x-100"
          />

          <CountdownOverlay count={countdown} />

          {status === 'getting-ready' && (
             <div className="absolute top-[10%] left-0 right-0 flex justify-center pointer-events-none z-30">
                <div className="bg-black/10 backdrop-blur-md text-white px-4 py-2 rounded-full font-serif text-md animate-in fade-in zoom-in-95 duration-300">
                    𝕘𝕖𝕥 𝕣𝕖𝕒𝕕𝕪 𝕗𝕠𝕣 {(photosTaken + 1) === 1 ? '𝕗𝕚𝕣𝕤𝕥' : (photosTaken + 1) === 2 ? '𝕤𝕖𝕔𝕠𝕟𝕕' : (photosTaken + 1) === 3 ? '𝕥𝕙𝕚𝕣𝕕' : (photosTaken + 1) === 4 ? '𝕝𝕒𝕤𝕥' : `${photosTaken + 1}`} 𝕡𝕙𝕠𝕥𝕠...
                </div>
             </div>
          )}

          <FlashEffect trigger={isCapturing} />

          {/* Controls Overlay - Close Button */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
             <div className="flex justify-end pointer-events-auto">
               <Button 
                  onClick={onClose}
                  variant="ghost" 
                  className="text-white hover:bg-white/20 hover:text-white rounded-full bg-[#745e59]/20 backdrop-blur-sm h-10 w-10 p-0"
                >
                  ✕
                </Button>
             </div>

             {status !== 'idle' && (
               <div className="flex justify-center gap-3 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        i < photosTaken 
                          ? "bg-white shadow-[0_0_8px_rgba(255,255,240,0.8)] scale-110" 
                          : "bg-white/20 border border-white/50"
                      }`}
                    />
                  ))}
               </div>
             )}
          </div>
        </div>

        {/* External Controls - Take Photo Button */}
        <div className="flex flex-col items-center gap-2 pb-4 py-7">
          {stream && !isLoading && status === 'idle' && (
            <>
              <Button
                onClick={onStartSession}
                size="lg"
                className="btn-minimal font-serif text-lg px-9 py-7"
              >
                (｡ •̀  ᵕ 📷) ✨
              </Button>
              <p className="text-s text-stone-500 font-serif italic opacity-70">
                * 𝕥𝕒𝕜𝕖 𝟜 𝕡𝕚𝕔𝕤 𝕒𝕥 𝕠𝕟𝕔𝕖 𝕨𝕚𝕥𝕙 𝕒 𝟛-𝕤𝕖𝕔 𝕔𝕠𝕦𝕟𝕥𝕕𝕠𝕨𝕟 𝕗𝕠𝕣 𝕖𝕒𝕔𝕙
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
);

CameraView.displayName = "CameraView";
