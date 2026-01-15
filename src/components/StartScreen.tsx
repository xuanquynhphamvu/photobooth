'use client';

import { Button } from "@/components/ui/button";

interface StartScreenProps {
  onUseCamera: () => void;
  onUpload: () => void;
}

export function StartScreen({ onUseCamera, onUpload }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12 text-center p-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-700">
      <div className="space-y-6">
        <h1 className="text-7xl font-serif text-stone-900 tracking-tighter">Photobooth</h1>
        <p className="text-2xl text-stone-600 italic font-serif">Capture your moment in time</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
        <Button
          size="lg"
          onClick={onUseCamera}
          className="text-xl px-12 py-8 bg-stone-900 text-stone-50 hover:bg-stone-800 transition-all transform hover:scale-105 shadow-xl font-serif cursor-pointer min-w-[240px]"
        >
          Use Camera
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onUpload}
          className="text-xl px-12 py-8 border-2 border-stone-800 text-stone-900 hover:bg-stone-100 transition-all transform hover:scale-105 shadow-xl font-serif cursor-pointer min-w-[240px]"
        >
          Upload Photos
        </Button>
      </div>
    </div>
  );
}
