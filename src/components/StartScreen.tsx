'use client';

import { Button } from "@/components/ui/button";

interface StartScreenProps {
  onUseCamera: () => void;
  onUpload: () => void;
}

export function StartScreen({ onUseCamera, onUpload }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] space-y-12 text-center p-8 w-full max-w-4xl animate-in fade-in zoom-in-95 duration-700">
      <div className="space-y-6">
        <img 
          src="/melphotobooth.svg" 
          alt="Photobooth Logo"
          className="h-32 w-auto object-contain mb-4" 
        />
      </div>
      
      <div className="flex col-2 sm:flex-row gap-6 w-full justify-center items-center">
        <Button
          size="lg"
          onClick={onUseCamera}
          className="btn-minimal text-xl px-3 py-8 min-w-[150px] max-w-[280px] flex items-center justify-center"
        >
          ˙✧˖°📸⋆｡ ˚
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={onUpload}
          className="btn-minimal text-xl px-3 py-8 min-w-[150px] max-w-[280px] flex items-center justify-center"
        >
          ˙✧˖°📂 ⋆｡˚
        </Button>
      </div>
    </div>
  );
}
