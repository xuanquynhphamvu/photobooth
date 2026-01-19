'use client';

import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LayoutType, generateCompositeImage } from "@/lib/photo-generator";
import { Check } from "lucide-react";
import { LAYOUT_CONFIG, getFormattedDate } from "@/lib/layout-config";

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
  { id: 'cream', value: '#e6dbc6', label: 'Cream' },
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
  
  // Calculate scale for preview synchronization
  const { photoWidth, padding } = LAYOUT_CONFIG;
  const STRIP_CANVAS_WIDTH = photoWidth + (padding * 2);
  const GRID_CANVAS_WIDTH = (photoWidth * 2) + (padding * 3);
  const PREVIEW_WIDTH_STRIP = 320;
  const PREVIEW_WIDTH_GRID = 480;

  const scale = layout === 'strip' 
    ? PREVIEW_WIDTH_STRIP / STRIP_CANVAS_WIDTH 
    : PREVIEW_WIDTH_GRID / GRID_CANVAS_WIDTH;
  
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
        
        // Don't call onSave prop creates a reset (logout) effect. 
        // We want to stay on this screen.
        // onSave?.();
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
              "grid gap-4 mb-2",
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
          <div 
            className="flex flex-col items-center justify-center"
            style={{ 
                height: LAYOUT_CONFIG.bottomBannerHeight * scale,
                gap: LAYOUT_CONFIG.gap * scale
            }}
          >
             {note && note.trim().length > 0 ? (
                 <h2 
                    className="font-serif text-center font-bold"
                    style={{ 
                        fontSize: LAYOUT_CONFIG.titleFontSize * scale,
                        color: (backgroundColor === '#000000' || backgroundColor === '#1c1917' || backgroundColor === '#745e59') 
                            ? LAYOUT_CONFIG.colors.textOnDark 
                            : LAYOUT_CONFIG.colors.textOnLight
                    }}
                 >
                     {note}
                 </h2>
             ) : (
                 <div 
                    className="transition-all duration-300"
                    style={{
                        height: LAYOUT_CONFIG.logoHeight * scale,
                        width: (LAYOUT_CONFIG.logoHeight * scale) * 5, // Asptect ratio 5:1
                        backgroundColor: (backgroundColor === '#000000' || backgroundColor === '#1c1917' || backgroundColor === '#745e59') 
                            ? '#e6dbc6' 
                            : '#745e59',
                        maskImage: 'url(/melphotobooth.svg)',
                        WebkitMaskImage: 'url(/melphotobooth.svg)',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain'
                    }}
                 />
             )}
             
             <p 
                className={cn(
                    "font-serif italic",
                    (backgroundColor === '#000000' || backgroundColor === '#1c1917' || backgroundColor === '#745e59') ? "text-stone-400" : "text-stone-500"
                )}
                style={{ fontSize: LAYOUT_CONFIG.dateFontSize * scale }}
             >
                 {getFormattedDate()}
             </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md flex flex-col bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-stone-200 shadow-xl">
        
        {/* Select Photos Section */}
        <div className="space-y-2 border-b border-stone-100 pb-4 mb-4">
            <h3 className="font-serif text-lg text-[#745e59] text-center">𝄞⨾𓍢ִ໋⋆𝓈𝑒𝓁𝑒𝒸𝓉 𝓅𝒽𝑜𝓉𝑜𝓈 🎞️ 𖥔 ݁ ˖</h3>
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

        <div className="space-y-4">
            {/* Filter Section */}
            <div className="border-b border-stone-100 pb-4">
                <h3 className="font-serif text-lg text-[#745e59] text-center">𝒻𝒾𝓁𝓉𝑒𝓇 🪄⊹₊⟡⋆</h3>
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

            {/* Color Section */}
            <div className="border-b border-stone-100 pb-4">
                <h3 className="font-serif text-lg text-[#745e59] text-center">𝒸𝑜𝓁𝑜𝓇 ✩ ₊˚˚🫧⊹♡</h3>
                <div className="flex flex-wrap gap-3 justify-center py-2">
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

            {/* Note Section */}
            <div>
                <h3 className="font-serif text-lg text-[#745e59] text-center">𝓃𝑜𝓉𝑒 ✎𓂃.☘︎ ݁˖</h3>
                <div className="py-2 flex justify-center">
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="𝓉𝓎𝓅𝑒 𝒽𝑒𝓇𝑒..."
                        maxLength={20}
                        className="w-3/4 text-center bg-transparent border border-stone-200 rounded-md focus:border-[#745e59] focus:ring-1 focus:ring-[#745e59] outline-none px-4 py-2 font-serif text-[#745e59] placeholder:text-stone-300 transition-all"
                    />
                </div>
            </div>
        </div>


        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col gap-3">
            <div className="flex gap-3 w-full">
                <Button 
                    onClick={onRetake} 
                    variant="outline"
                    className="btn-minimal flex-1 py-7 text-lg"
                    disabled={isGenerating}
                >
                    ↩ 𝓇𝑒𝓉𝒶𝓀𝑒
                </Button>
                <Button 
                    onClick={handleSave} 
                    className="btn-minimal flex-1 py-7 text-lg"
                    disabled={isGenerating}
                >
                    {isGenerating ? "Processing..." : "‧₊˚ ☁️⋅ 𝓈𝒶𝓋𝑒 ♡"}
                </Button>
            </div>
            
            <Button 
                onClick={onRetake}
                variant="ghost"
                className="w-full font-serif text-[#745e59] hover:bg-[#745e59]/10"
                disabled={isGenerating}
            >
                ✨ 𝓈𝓉𝒶𝓇𝓉 𝓃𝑒𝓌 𝓈𝑒𝓈𝓈𝒾𝑜𝓃 📸
            </Button>
        </div>
      </div>
    </div>
  );
}
