'use client';

import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LayoutType, generateCompositeImage } from "@/lib/photo-generator";
import { Check } from "lucide-react";

interface ReviewScreenProps {
  photos: string[];
  onRetake: () => void;
  onSave?: () => void;
  initialLayout: LayoutType;
}

type FilterType = 'none' | 'sepia' | 'bw' | 'vintage';

const FILTERS: { id: FilterType; name: string; class: string }[] = [
  { id: 'sepia', name: 'Sepia', class: 'filter-sepia' },
  { id: 'bw', name: 'B&W', class: 'filter-bw' },
  { id: 'vintage', name: 'Vintage', class: 'filter-vintage' },
];

const BACKGROUND_COLORS = [
  { id: 'stone', value: '#f5f5f4', label: 'Stone' },
  { id: 'white', value: '#ffffff', label: 'White' },
  { id: 'dark', value: '#745e59', label: 'Dark' },
  { id: 'pink', value: '#ffe4e6', label: 'Pink' },
  { id: 'mint', value: '#d1fae5', label: 'Mint' },
  { id: 'blue', value: '#e0f2fe', label: 'Blue' },
  { id: 'yellow', value: '#fef9c3', label: 'Yellow' },
  { id: 'purple', value: '#f3e8ff', label: 'Purple' },
];

export function ReviewScreen({ photos, onRetake, onSave, initialLayout }: ReviewScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [backgroundColor, setBackgroundColor] = useState<string>(BACKGROUND_COLORS[0].value);
  const [layout] = useState<LayoutType>(initialLayout);
  const [note, setNote] = useState<string>('');
  
  // Default selection based on layout
  const defaultSelectionCount = layout === 'strip' ? 3 : 4;
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(photos.slice(0, defaultSelectionCount));
  const [isGenerating, setIsGenerating] = useState(false);

  const filterClass = FILTERS.find(f => f.id === activeFilter)?.class || 'filter-none';

  const togglePhoto = (photo: string) => {
    // Current limit based on layout
    const maxPhotos = layout === 'strip' ? 3 : 4;

    if (selectedPhotos.includes(photo)) {
        // Prevent removing the last photo
        if (selectedPhotos.length > 1) {
            setSelectedPhotos(prev => prev.filter(p => p !== photo));
        }
    } else {
        // Add photo logic
        // If we are at max capacity, we need to remove one first? 
        // Or just don't add? 
        // Requirement said: "Review screen will default to the first 3 or 4 photos, and allow the user to swap them out."
        // Let's implement swap mode: if full, replace the ... last one? or prevent adding?
        // Let's prevent adding if full, showing a message or just simple replacement logic (remove first added? no that's confusing).
        // Let's simply: if full, remove the first selected one (FIFO) to make room? Or strictly enforcement.
        // User probably expects to deselect one then select another.
        // But let's try auto-swap: if full, remove the one that is NOT the current one being toggled (obviously).
        // Let's just implement: if (length >= maxPhotos) -> remove the first one from selectedPhotos then add new one.
        
        const newSelection = [...selectedPhotos];
        if (newSelection.length >= maxPhotos) {
             // Remove the first one from the selection (providing a FIFO-like feel for the selection slot)
             newSelection.shift();
        }

        // Now insert the new photo maintaining original order
        const originalIndex = photos.indexOf(photo);
        
        // Find correct insertion point among the REMAINING selection
        let inserted = false;
        for (let i = 0; i < newSelection.length; i++) {
            if (photos.indexOf(newSelection[i]) > originalIndex) {
                newSelection.splice(i, 0, photo);
                inserted = true;
                break;
            }
        }
        if (!inserted) newSelection.push(photo);
        
        setSelectedPhotos(newSelection);
    }
  };

  const handleSave = async () => {
    setIsGenerating(true);
    try {
        const dataUrl = await generateCompositeImage(selectedPhotos, activeFilter, backgroundColor, layout, note);
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `photobooth-session-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        onSave?.();
    } catch (e) {
        console.error("Failed to generate image", e);
        alert("Failed to save photo. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen max-w-7xl mx-auto p-8 gap-12">
      
      {/* Photo Preview */}
      <div className="flex-shrink-0">
        <div 
          className={cn(
              "flex flex-col p-6 rounded-lg shadow-2xl transition-all duration-500 mx-auto bg-stone-50",
              layout === 'strip' ? "w-[320px]" : "w-[480px]"
          )}
          style={{ backgroundColor }}
        >
          <div className={cn(
              "grid gap-4 mb-8",
              layout === 'strip' ? "grid-cols-1" : "grid-cols-2"
          )}>
            {selectedPhotos.map((photo, index) => (
                <div 
                key={index} 
                className="relative aspect-[4/3] overflow-hidden rounded bg-stone-100 animate-in fade-in zoom-in-95 duration-300 fill-mode-backwards"
                style={{ animationDelay: `${index * 50}ms` }}
                >
                <img 
                    src={photo} 
                    alt={`Selected Photo ${index + 1}`} 
                    className={cn("w-full h-full object-cover transition-all duration-300", filterClass)} 
                />
                </div>
            ))}
          </div>

          {/* Footer Banner */}
          <div className="flex flex-col items-center justify-center gap-2 pb-2">
             {note && note.trim().length > 0 ? (
                 <h2 className={cn(
                     "font-serif text-3xl text-center font-bold",
                     (backgroundColor === '#000000' || backgroundColor === '#1c1917' || backgroundColor === '#745e59') ? "text-stone-100" : "text-stone-900"
                 )}>
                     {note}
                 </h2>
             ) : (
                 <img 
                    src="/melphotobooth.svg" 
                    alt="Mel Photobooth" 
                    className={cn(
                        "h-12 w-auto object-contain transition-all duration-300 drop-shadow-md",
                        (backgroundColor === '#000000' || backgroundColor === '#1c1917' || backgroundColor === '#745e59') && "invert brightness-0"
                    )}
                 />
             )}
             
             <p className={cn(
                 "font-serif italic text-sm",
                 (backgroundColor === '#000000' || backgroundColor === '#1c1917' || backgroundColor === '#745e59') ? "text-stone-400" : "text-stone-500"
             )}>
                 {new Date().toLocaleDateString()}
             </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md flex flex-col gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-stone-200 shadow-xl">
        
        <div className="space-y-2">
            <h3 className="font-serif text-lg text-[#745e59] border-b border-stone-100 pb-1 text-center">𝄞⨾𓍢ִ໋⋆𝓈𝑒𝓁𝑒𝒸𝓉 𝓅𝒽𝑜𝓉𝑜𝓈 🎞️ 𖥔 ݁ ˖</h3>
            <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, index) => {
                    const isSelected = selectedPhotos.includes(photo);
                    const selectedIndex = selectedPhotos.indexOf(photo) + 1;
                    
                    return (
                        <button
                            key={index}
                            onClick={() => togglePhoto(photo)}
                            className={cn(
                                "relative aspect-[4/3] rounded overflow-hidden transition-all duration-200 ring-offset-2",
                                isSelected ? "ring-2 ring-[#745e59] opacity-100" : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
                            )}
                        >
                            <img 
                                src={photo} 
                                alt={`Capture ${index + 1}`} 
                                className="w-full h-full object-cover" 
                            />
                            {isSelected && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-[#745e59] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                    {selectedIndex}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-stone-500 font-serif italic text-right">
                {selectedPhotos.length}/{defaultSelectionCount} selected
            </p>
        </div>

        <div className="space-y-3">
            <div>
                <h3 className="font-serif text-lg text-[#745e59] border-b border-stone-100 pb-1 text-center">𝒻𝒾𝓁𝓉𝑒𝓇 🪄⊹₊⟡⋆</h3>
                <div className="flex flex-wrap gap-2 justify-center py-2">
                        {FILTERS.map((filter) => (
                        <Button
                        key={filter.id}
                        variant={activeFilter === filter.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter(filter.id)}
                        className={cn(
                            "font-serif min-w-[3rem]",
                            activeFilter === filter.id ? "bg-[#745e59]" : "text-stone-600 border-stone-200"
                        )}
                        >
                        {filter.name}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-serif text-lg text-[#745e59] border-b border-stone-100 pb-1 text-center">𝒸𝑜𝓁𝑜𝓇 ✩ ₊₊˚🌈˚🫧⊹♡</h3>
                <div className="flex flex-wrap gap-3.5 justify-center py-2">
                    {BACKGROUND_COLORS.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => setBackgroundColor(color.value)}
                            className={cn(
                                "w-8 h-8 rounded-full border-2 transition-all shadow-sm hover:scale-110",
                                backgroundColor === color.value ? "border-[#745e59] scale-110 ring-2 ring-stone-100 ring-offset-2" : "border-stone-200 hover:border-stone-300"
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                        />
                    ))}
                </div>
            </div>


            <div>
                <h3 className="font-serif text-lg text-[#745e59] border-b border-stone-100 pb-1 text-center">𝓃𝑜𝓉𝑒 ✎ ̼</h3>
                <div className="py-2">
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Enter a custom note..."
                        maxLength={20}
                        className="w-full text-center bg-transparent border-b-2 border-stone-200 focus:border-[#745e59] outline-none px-2 py-1 font-serif text-[#745e59] placeholder:text-stone-300 transition-colors"
                    />
                </div>
            </div>
        </div>


        <div className="mt-4 pt-4 border-t border-stone-100 flex gap-3">
                <Button 
                onClick={onRetake} 
                variant="outline"
                className="btn-minimal px-8 py-7 text-lg"
                disabled={isGenerating}
            >
                ↩ 𝓇𝑒𝓉𝒶𝓀𝑒
            </Button>
            <Button 
                onClick={handleSave} 
                className="btn-minimal px-10 py-7 text-lg"
                disabled={isGenerating}
            >
                {isGenerating ? "Processing..." : "‧₊˚ ☁️⋅ 𝓈𝒶𝓋𝑒 ♡🪐༘⋆"}
            </Button>
        </div>
      </div>
    </div>
  );
}
