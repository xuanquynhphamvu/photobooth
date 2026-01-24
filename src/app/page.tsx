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
import { useOverflowControl } from "@/hooks/useOverflowControl";

export default function Home() {
  const [view, setView] = useState<'start' | 'camera' | 'review' | 'upload' | 'layout'>('start');
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('strip');
  // Track if photos came from upload or camera
  const [isUploadSource, setIsUploadSource] = useState(false);
  // Track selected orientation from LayoutSelectionScreen
  const [isPortraitSelection, setIsPortraitSelection] = useState(true);

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
    setIsUploadSource(false);
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
  
  const handleBack = () => {
    setView('layout');
  };

  const handleUpload = () => {
    setIsUploadSource(true);
    setView('upload');
  };

  // No longer need aspect ratio from upload
  const handleUploadComplete = (uploadedPhotos: string[]) => {
    setPhotos(uploadedPhotos);
    setView('layout');
  };

  const handleLayoutBack = () => {
    if (isUploadSource) {
      setView('upload');
    } else {
      resetSession();
      handleUseCamera();
    }
  };

  const handleLayoutSelect = (layout: LayoutType, isPortrait: boolean) => {
    setSelectedLayout(layout);
    setIsPortraitSelection(isPortrait);
    setView('review');
  };

  const mainRef = useRef<HTMLElement>(null);
  useOverflowControl(mainRef);

  return (
    <main ref={mainRef} className="min-h-[100dvh] p-4 flex flex-col items-center justify-center bg-[#FCF7EF]">
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
                photosTaken={photos.length}
                status={status}
            />

        </div>
      )}

      {view === 'upload' && (
        <UploadScreen 
            onUploadComplete={handleUploadComplete}
            onCancel={() => setView('start')}
        />
      )}

      {view === 'layout' && (
        <LayoutSelectionScreen 
          onSelectLayout={handleLayoutSelect} 
          onBack={handleLayoutBack}
        />
      )}

      {view === 'review' && (
        <ReviewScreen 
            photos={photos}
            onRetake={handleRetake}
            onBack={handleBack}
            onSave={handleSave}
            initialLayout={selectedLayout}
            isUpload={isUploadSource}
            photoOrientation={isPortraitSelection ? 'portrait' : 'landscape'}
        />
      )}
    </main>
  );
}
