'use client';

import { StartScreen } from "@/components/StartScreen";
import { CameraView, CameraViewHandle } from "@/components/CameraView";
import { ReviewScreen } from "@/components/ReviewScreen";
import { LayoutSelectionScreen } from "@/components/LayoutSelectionScreen";
import { UploadScreen } from "@/components/UploadScreen";
import { useCamera } from "@/hooks/useCamera";
import { usePhotoSession } from "@/hooks/usePhotoSession";
import { LayoutType } from "@/lib/photo-generator";
import { useState, useRef } from "react";

export default function Home() {
  const [view, setView] = useState<'start' | 'camera' | 'review' | 'upload' | 'layout'>('start');
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('strip');
  const { stream, error, isLoading, startCamera, stopCamera } = useCamera();
  const cameraRef = useRef<CameraViewHandle>(null);

  const { status, countdown, photos, setPhotos, startSession, resetSession } = usePhotoSession({
    captureFn: async () => {
        return cameraRef.current?.capture() ?? null;
    },
    onFinish: () => {
        console.log("Session finished, resizing to layout selection");
        setView('layout');
        stopCamera();
    }
  });

  const handleUseCamera = async () => {
    setView('camera');
    await startCamera();
  };

  const handleCloseCamera = () => {
    stopCamera();
    resetSession();
    setView('start');
  };

  const handleRetake = () => {
    resetSession();
    // Restart camera if needed, or go back to start
    setView('start'); 
    // Ideally we might want to go straight back to camera, but let's go to start for simplicity/cleanup
  };

  const handleSave = () => {
    // Save logic handled in ReviewScreen component now
    handleCloseCamera();
  };

  const handleUpload = () => {
    setView('upload');
  };

  const handleUploadComplete = (uploadedPhotos: string[]) => {
    setPhotos(uploadedPhotos);
    setView('layout');
  };

  const handleLayoutSelect = (layout: LayoutType) => {
    setSelectedLayout(layout);
    setView('review');
  };

  return (
    <main className="min-h-screen p-4 flex items-center justify-center">
      {view === 'start' && (
        <StartScreen onUseCamera={handleUseCamera} onUpload={handleUpload} />
      )}
      
      {view === 'camera' && (
        <div className="space-y-4">
             <CameraView 
                ref={cameraRef}
                stream={stream} 
                error={error} 
                isLoading={isLoading}
                onClose={handleCloseCamera}
                countdown={countdown}
                isCapturing={status === 'capturing'}
                onStartSession={startSession}
            />
            {photos.length > 0 && (
                <div className="flex gap-2 justify-center">
                    {photos.map((p, i) => (
                        <img key={i} src={p} alt={`Captured photo ${i + 1}`} className="w-16 h-12 object-cover border border-white" />
                    ))}
                </div>
            )}
        </div>
      )}

      {view === 'upload' && (
        <UploadScreen 
            onUploadComplete={handleUploadComplete}
            onCancel={() => setView('start')}
        />
      )}

      {view === 'layout' && (
        <LayoutSelectionScreen onSelectLayout={handleLayoutSelect} />
      )}

      {view === 'review' && (
        <ReviewScreen 
            photos={photos}
            onRetake={handleRetake}
            onSave={handleSave}
            initialLayout={selectedLayout}
        />
      )}
    </main>
  );
}
