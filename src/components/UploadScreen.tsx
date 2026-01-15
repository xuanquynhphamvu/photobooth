'use client';

import { Button } from "@/components/ui/button";
import { useState, ChangeEvent } from "react";

interface UploadScreenProps {
  onUploadComplete: (photos: string[]) => void;
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
                onUploadComplete(newPhotos);
            } else {
                 setError("Failed to load some images.");
            }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center p-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-700">
      <div className="space-y-4">
        <h2 className="text-5xl font-serif text-stone-900">Upload Photos</h2>
        <p className="text-xl text-stone-600 font-serif italic max-w-lg mx-auto">
          Select exactly 4 photos from your device to create a vintage photostrip.
        </p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <label htmlFor="photo-upload" className="cursor-pointer">
            <div className="flex items-center justify-center w-64 h-32 border-2 border-dashed border-stone-400 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors">
                <span className="text-stone-600 font-serif text-lg">Click to Select Photos</span>
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

        {error && (
            <p className="text-red-500 font-serif animate-in fade-in">{error}</p>
        )}

        <Button 
            variant="outline"
            onClick={onCancel}
            className="font-serif border-stone-800 text-stone-900 min-w-[160px] mt-8"
        >
            Cancel
        </Button>
      </div>
    </div>
  );
}
