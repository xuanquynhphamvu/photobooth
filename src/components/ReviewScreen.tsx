'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutType, generateCompositeImage } from "@/lib/photo-generator";
import { LAYOUT_CONFIG, getFormattedDate } from "@/lib/layout-config";
import { useOrientation } from "@/hooks/useOrientation";

interface ReviewScreenProps {
  photos: string[];
  onRetake: () => void;
  onSave?: () => void;
  initialLayout: LayoutType;
}

type FilterType = 'none' | 'sepia' | 'bw' | 'vintage';

const FILTERS: { id: FilterType; name: string; class: string }[] = [
  { id: 'none', name: 'Normal', class: 'filter-none' },
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
  const { isPortrait } = useOrientation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [backgroundColor, setBackgroundColor] = useState<string>(BACKGROUND_COLORS[0].value);
  const [layout] = useState<LayoutType>(initialLayout);
  const [note, setNote] = useState<string>('');
  
  // Calculate scale for preview synchronization

  const { padding } = LAYOUT_CONFIG;
  const { width: photoWidth, height: photoHeight } = LAYOUT_CONFIG.getDimensions(isPortrait);
  
  const STRIP_CANVAS_WIDTH = photoWidth + (padding * 2);
  const GRID_CANVAS_WIDTH = (photoWidth * 2) + (padding * 3);
  
  // Adjust preview container widths for mobile/portrait
  const PREVIEW_WIDTH_STRIP = isPortrait ? 300 : 350;
  const PREVIEW_WIDTH_GRID = isPortrait ? 350 : 700;

  const scale = layout === 'strip' 
    ? PREVIEW_WIDTH_STRIP / STRIP_CANVAS_WIDTH 
    : PREVIEW_WIDTH_GRID / GRID_CANVAS_WIDTH;
  
  // Default selection based on layout
  const defaultSelectionCount = 4;
  const [selectedPhotos] = useState<string[]>(photos.slice(0, defaultSelectionCount));
  const [isGenerating, setIsGenerating] = useState(false);

  const filterClass = FILTERS.find(f => f.id === activeFilter)?.class || 'filter-none';



  const handleSave = async () => {
    setIsGenerating(true);
    try {
        const dataUrl = await generateCompositeImage(selectedPhotos, activeFilter, backgroundColor, layout, note, isPortrait);
        
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
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-[100dvh] w-full max-w-7xl mx-auto p-4 md:p-8 gap-6 lg:gap-12">
      
      {/* Photo Preview */}
      <div className="flex-shrink-0">
        <div 
          className={cn(
              "flex flex-col p-6 rounded-lg shadow-2xl transition-all duration-500 mx-auto bg-stone-50 max-w-full",
              layout === 'strip' ? 
                  (isPortrait ? "w-full max-w-[320px]" : "w-full max-w-[350px]") : 
                  (isPortrait ? "w-full max-w-[370px]" : "w-full max-w-[700px]")
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
                className={cn(
                    "relative overflow-hidden rounded bg-stone-100 animate-in fade-in zoom-in-95 duration-300 fill-mode-backwards",
                    isPortrait ? "aspect-[3/4]" : "aspect-[4/3]"
                )}
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
      <div className={cn(
        "w-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200 shadow-xl origin-top",
        isPortrait ? "max-w-full p-4 gap-4" : "max-w-md p-6 gap-6"
      )}>
        


        <div className="space-y-4">
            {/* Filter Section */}
            <div className="border-b border-stone-100 pb-4">
                <h3 className={cn("font-serif text-[#745e59] text-center", isPortrait ? "text-base" : "text-lg")}>𝒻𝒾𝓁𝓉𝑒𝓇 🪄⊹₊⟡⋆</h3>
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
                <h3 className={cn("font-serif text-[#745e59] text-center", isPortrait ? "text-base" : "text-lg")}>𝒸𝑜𝓁𝑜𝓇 ✩ ₊˚˚🫧⊹♡</h3>
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
                <h3 className={cn("font-serif text-[#745e59] text-center", isPortrait ? "text-base" : "text-lg")}>𝓃𝑜𝓉𝑒 ✎𓂃.☘︎ ݁˖</h3>
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
                <Button 
                    onClick={handleSave} 
                    className={cn("btn-minimal w-full", isPortrait ? "py-5 text-base" : "py-7 text-lg")}
                    disabled={isGenerating}
                >
                    {isGenerating ? "Processing..." : "‧₊˚ ☁️⋅ 𝓈𝒶𝓋𝑒 ♡"}
                </Button>
            
            <Button 
                onClick={onRetake}
                variant="ghost"
                className="w-full font-serif text-[#745e59] hover:bg-[#745e59]/10"
                disabled={isGenerating}
            >
                ✨ 𝓇𝑒𝓉𝒶𝓀𝑒 𝑜𝓇 𝓈𝓉𝒶𝓇𝓉 𝓃𝑒𝓌 𝓈𝑒𝓈𝓈𝒾𝑜𝓃 📸
            </Button>
        </div>
      </div>
    </div>
  );
}
