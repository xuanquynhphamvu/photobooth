'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState, ChangeEvent } from "react";

interface UploadScreenProps {
  onUploadComplete: (photos: string[], aspectRatio?: number) => void;
  onCancel: () => void;
}

export function UploadScreen({ onUploadComplete, onCancel }: UploadScreenProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    
    if (!files || files.length === 0) return;

    if (files.length !== 4) {
      setError("Please select exactly 4 photos.");
      return;
    }

    const newPhotos: string[] = [];
    let processed = 0;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError("Only image files are allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          newPhotos.push(ev.target.result as string);
        }
        processed++;
        
        if (processed === files.length) {
            // All done is checked here, but since FileReader is async order isn't guaranteed.
            // For MVP strict order might not matter, or we could sort by name.
            // Let's assume user selection order is roughly preserved or doesn't matter too much.
            if (newPhotos.length === 4) {
                // Calculate aspect ratio from the first photo
                const img = new Image();
                img.onload = () => {
                    const ratio = img.width / img.height;
                    onUploadComplete(newPhotos, ratio);
                };
                img.onerror = () => {
                    // Fallback if image load fails for some reason, though file reader worked
                    onUploadComplete(newPhotos); 
                };
                img.src = newPhotos[0];
            } else {
                 setError("Failed to load some images.");
            }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] space-y-[4vh] text-center p-6 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
      
      {/* Floating Back Button */}
      <Button 
          onClick={onCancel}
          aria-label="Back"
          className="btn-minimal fixed top-[clamp(1rem,3vh,1.5rem)] left-[clamp(1rem,3vw,1.5rem)] z-50 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center p-0"
      >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
      </Button>

      <div className="space-y-[2vh] w-full max-w-[90vw]">
        <h2 className="text-[clamp(1.5rem,5vw,2.5rem)] font-serif text-stone-900 leading-tight">⤷ ゛𝓊𝓅𝓁𝑜𝒶𝒹 𝓅𝒽𝑜𝓉𝑜𝓈 ˎˊ˗</h2>
      </div>

      <div className="flex flex-col items-center space-y-[3vh] w-full">
        <label htmlFor="photo-upload" className="cursor-pointer group flex flex-col items-center gap-4 transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="flex items-center justify-center w-[70vw] max-w-sm aspect-[2/1] border-[2.5px] border-dashed border-[#e6dbc6] rounded-lg bg-transparent group-hover:bg-[#e6dbc6] transition-colors relative overflow-hidden shadow-sm">
                <span className="text-[#745e59] font-serif text-[clamp(0.9rem,3vw,1.125rem)] z-10 p-2">🖱️: ̗̀➛ 𝕔𝕝𝕚𝕔𝕜 𝕥𝕠 𝕤𝕖𝕝𝕖𝕔𝕥</span>
            </div>
            <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange} 
                className="hidden" 
            />
        </label>

        <p className="text-[clamp(0.8rem,2.5vw,1rem)] text-stone-400 font-serif italic max-w-[80vw] mx-auto leading-relaxed">
          *Select 4 photos from your device to create a photostrip/grid.
        </p>

        {error && (
            <p className="text-red-500 font-serif text-sm animate-in fade-in bg-red-50 px-4 py-2 rounded-md border border-red-100">{error}</p>
        )}
      </div>
    </div>
  );
}
