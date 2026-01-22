'use client';

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LayoutType, generateCompositeImage } from "@/lib/photo-generator";
import { LAYOUT_CONFIG, getFormattedDate } from "@/lib/layout-config";


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
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
    }
  }, []);
  const [view, setView] = useState<'review' | 'printing'>('review'); // Moved up for access in config
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [backgroundColor, setBackgroundColor] = useState<string>(BACKGROUND_COLORS[0].value);
  const [layout] = useState<LayoutType>(initialLayout);
  const [note, setNote] = useState<string>('');
  
  // Calculate scale for preview synchronization

  const { padding } = LAYOUT_CONFIG;
  const { width: photoWidth, height: photoHeight } = LAYOUT_CONFIG.getDimensions(isPortrait);
  
  const STRIP_CANVAS_WIDTH = photoWidth + (padding * 2);
  const GRID_CANVAS_WIDTH = (photoWidth * 2) + (padding * 3);
  
  // === ADJUST SIZES HERE for Photo Ratio & Camera Fit ===
  const PREVIEW_SIZES = {
    printing: {
      strip: { 
        portrait: { photo: 250, camera: 700 }, 
        landscape: { photo: 200, camera: 700 } 
      },
      grid: { 
        portrait: { photo: 200, camera: 700 }, 
        landscape: { photo: 200, camera: 700 } 
      },
    },
    review: {
      strip: { 
        portrait: { photo: 150, camera: 0 }, 
        landscape: { photo: 350, camera: 0 } 
      },
      grid: { 
        portrait: { photo: 370, camera: 0 }, 
        landscape: { photo: 700, camera: 0 } 
      },
    }
  };

  const currentModeSizes = view === 'printing' ? PREVIEW_SIZES.printing : PREVIEW_SIZES.review;
  const currentLayoutSizes = layout === 'strip' ? currentModeSizes.strip : currentModeSizes.grid;
  const currentOrientationSizes = isPortrait ? currentLayoutSizes.portrait : currentLayoutSizes.landscape;
  
  const targetWidth = currentOrientationSizes.photo;
  const targetCameraWidth = currentOrientationSizes.camera;

  const CANVAS_WIDTH = layout === 'strip' ? STRIP_CANVAS_WIDTH : GRID_CANVAS_WIDTH;
  const scale = targetWidth / CANVAS_WIDTH;
  
  // Default selection based on layout
  const defaultSelectionCount = 4;
  const [selectedPhotos] = useState<string[]>(photos.slice(0, defaultSelectionCount));
  const [isGenerating, setIsGenerating] = useState(false);



  const filterClass = FILTERS.find(f => f.id === activeFilter)?.class || 'filter-none';

  const downloadPhoto = async () => {
    setIsGenerating(true);
    try {
        const dataUrl = await generateCompositeImage(selectedPhotos, activeFilter, backgroundColor, layout, note, isPortrait);
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `photobooth-session-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Failed to generate image", e);
        alert(`Failed to save photo: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        setIsGenerating(false);
    }
  }

  const handleSave = async () => {
    // Switch to printing view
    setView('printing');
    
    // Wait for slide down animation (3s)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Download
    await downloadPhoto();
  };

  const handleBackToSettings = () => {
    setView('review');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full max-w-7xl mx-auto p-4 md:p-8 overflow-hidden">
      
      {/* Content Container */}
      <div className={cn(
          "flex flex-col transition-all duration-500 w-full items-center justify-center",
          view === 'review' ? "lg:flex-row gap-6 lg:gap-12" : "gap-8"
      )}>

      <div className={cn(
          "flex-shrink-0 relative z-10 transition-all duration-500",
          // ADJUST OVERALL SIZE HERE: Change 'scale-[0.6]' to 'scale-[0.8]' (bigger) or 'scale-[0.5]' (smaller)
          // This scales BOTH the photo and the camera slot together.
          // Added negative margins to pull buttons up into the empty space left by scaling
          view === 'printing' ? "scale-[0.5] -mb-[500px] sm:scale-[0.6] sm:-mb-[400px] md:scale-[0.75] md:-mb-[200px] lg:scale-[0.9] lg:-mb-20 origin-top" : "" // responsive scaling
       )}>
        <div className="relative"> {/* Removed -mb-20 if it was causing issues, or keep if user wanted layout spacing. I will reset to just relative for clean slate if that's okay, or user can re-add. User said "it moves the photo... I want to adjust the line only". So I should probably remove the -mb-20 on the wrapper if I can, but I'll focus on the mask first. */}
            
            {/* Printer Slot Image */}
            <div className={cn(
                "absolute left-1/2 -translate-x-1/2 z-30 transition-opacity duration-500",
                // ADJUST SLOT POSITION: Change '-top-12' to move the camera image up/down
                "-top-12", 
                "h-auto", // Width is now controlled by config below
                view === 'printing' ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            style={{ width: targetCameraWidth }}
            >
               <img src="/camera-slot.png" alt="Camera Slot" className="w-full h-auto drop-shadow-2xl" />
            </div>

            {/* 
                ADJUST STARTING LINE POSITION (Printing Only):
                - Change '340px' inside the ternary operator below.
                - This moves the photo DOWN only during printing animation.
                - Settings screen stays at 0px.
            */}
            <div className="relative z-40 overflow-hidden" style={{ transform: view === 'printing' ? 'translateY(340px)' : 'translateY(0px)' }}>
            <div 
            className={cn(
                "flex flex-col shadow-2xl mx-auto bg-stone-50 relative",
                // Animation Logic
                view === 'printing' 
                    ? "animate-print-slide"
                    : ""
            )}
            style={{ 
                width: targetWidth, // Controlled by PREVIEW_SIZES config
                padding: padding * scale, // Dynamic padding to match generator
                borderRadius: 12 * scale, // Optional: Scale border radius too
                backgroundColor,
                transformOrigin: 'top center',
                transition: view === 'printing' ? 'none' : 'transform 0.5s'
            }}
            >

            <div 
                className={cn(
                    "grid mb-0", // Removed mb-2
                    layout === 'strip' ? "grid-cols-1" : "grid-cols-2"
                )}
                style={{ gap: padding * scale }} // Generator uses padding as gap
            >
                {selectedPhotos.map((photo, index) => (
                    <div 
                    key={index} 
                    className={cn(
                        "relative overflow-hidden bg-stone-100",
                        // Only animate fade in on initial review, not re-render during print
                        view === 'review' ? "animate-in fade-in zoom-in-95 duration-300 fill-mode-backwards" : "",
                        isPortrait ? "aspect-[3/4]" : "aspect-[4/3]"
                    )}
                    style={{ 
                        animationDelay: view === 'review' ? `${index * 50}ms` : '0ms',
                        borderRadius: 4 * scale // Scale internal radius
                    }}
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
            
            {/* Printer Slot Bottom - Visual Only (Masking the exit) */}
             <div className={cn(
                "absolute -bottom-4 left-0 right-0 h-8 bg-gradient-to-t from-white/0 to-white/0 z-20 pointer-events-none", 
            )} />
        </div>
      </div>

      {/* Controls: SETTINGS PANEL (Only in Review Mode) */}
      {view === 'review' && (
      <div className={cn(
        "w-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200 shadow-xl origin-top relative z-30 animate-in fade-in slide-in-from-bottom-4 duration-500",
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
      )}

      {/* Controls: PRINTING / SUCCESS MODE (Only in Printing Mode) */}
      {view === 'printing' && (
          <div className="flex flex-col gap-4 items-center animate-in fade-in duration-1000 delay-[3000ms] mt-8">
              <Button 
                  onClick={handleBackToSettings}
                  variant="outline"
                  className="font-serif border-[#745e59] text-[#745e59] hover:bg-[#745e59]/10 px-8 py-6 text-lg rounded-full"
              >
                  ← 𝐵𝒶𝒸𝓀 𝓉𝑜 𝓈𝑒𝓉𝓉𝒾𝓃𝑔𝓈
              </Button>

              <Button 
                  onClick={onRetake}
                  variant="ghost"
                  className="font-serif text-stone-500 hover:text-[#745e59]"
              >
                  ✨ 𝒮𝓉𝒶𝓇𝓉 𝓃𝑒𝓌 𝓈𝑒𝓈𝓈𝒾𝑜𝓃
              </Button>
          </div>
      )}

      </div>
    </div>
  );
}
