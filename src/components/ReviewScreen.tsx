'use client';

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Home, SlidersHorizontal, X } from "lucide-react";
import { LayoutType, generateCompositeImage } from "@/lib/photo-generator";
import { LAYOUT_CONFIG, getFormattedDate } from "@/lib/layout-config";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";


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

// === CONFIGURATION ===
// Adjust this value (0.1 to 1.0) to change how big the camera/photo appears in Printing View
const PRINTING_VIEW_WIDTH_PERCENTAGE = 0.8; 
// Adjust these values to cap the maximum size for each specific layout (1.0 = actual pixel size, ~700px wide)
const PRINTING_VIEW_SCALES = {
  strip: {
    portrait: 0.27,
    landscape: 0.27,
  },
  grid: {
    portrait: 0.5,
    landscape: 0.5,
  }
}; 



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
  const [showSettings, setShowSettings] = useState(false);
  
  // Dynamic scale for printing view (responsive to screen width)
  // Target width 700px covers the camera slot width
  const currentMaxScale = layout === 'strip' 
    ? (isPortrait ? PRINTING_VIEW_SCALES.strip.portrait : PRINTING_VIEW_SCALES.strip.landscape)
    : (isPortrait ? PRINTING_VIEW_SCALES.grid.portrait : PRINTING_VIEW_SCALES.grid.landscape);

  const printingScale = useResponsiveScale(700, PRINTING_VIEW_WIDTH_PERCENTAGE, currentMaxScale);
  
  // Calculate scale for preview synchronization

  const { padding } = LAYOUT_CONFIG;
  const { width: photoWidth, height: photoHeight } = LAYOUT_CONFIG.getDimensions(isPortrait);
  
  const STRIP_CANVAS_WIDTH = photoWidth + (padding * 2);
  const GRID_CANVAS_WIDTH = (photoWidth * 2) + (padding * 3);
  
  // === ADJUST SIZES HERE for Photo Ratio & Camera Fit ===
  const PREVIEW_SIZES = {
    printing: {
      strip: { 
        portrait: { photo: 300, camera: 700 }, 
        landscape: { photo: 300, camera: 700 } 
      },
      grid: { 
        portrait: { photo: 330, camera: 700 }, 
        landscape: { photo: 330, camera: 700 } 
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
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[100dvh] w-full mx-auto overflow-hidden max-w-none p-0"
    )}>
      
      {/* Content Container */}
      <div className={cn(
          "flex flex-col transition-all duration-500 w-full items-center justify-center flex-1 relative" // Always center, panel is now overlay
      )}>

      <div className={cn(
          "flex-shrink-0 relative z-10 transition-all duration-500",
          /* Responsive Group Wrapper: Camera + Photo */
          
          view === 'printing' 
            ? "absolute top-10 left-1/2 origin-top" // Removed hardcoded scales, relying on dynamic scale below. Removed -translate-x-1/2 here to coordinate with transform style.
            : "scale-[0.95] sm:scale-[0.85] md:scale-100 origin-center" // Keep Review Screen logic as is
       )}
       style={view === 'printing' ? { transform: `translateX(-50%) scale(${printingScale})` } : {}}
       >
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
            <div className="relative z-40 overflow-hidden" style={{ transform: view === 'printing' ? 'translateY(495px) translateX(5px)' : 'translateY(0px)' }}>
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
      {/* Controls: SETTINGS PANEL BUTTON (Only in Review Mode) */}
      {view === 'review' && (
        <>
            {/* Home / New Session Button (Top Left) */}
            <Button 
                onClick={onRetake}
                className="btn-minimal fixed top-6 left-6 z-50 w-14 h-14 flex items-center justify-center p-0"
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>
            {/* Toggle Button */}
            <div 
                className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
                onMouseEnter={() => setShowSettings(true)}
                onMouseLeave={() => setShowSettings(false)}
            >
                <div className={cn(
                    "transition-all duration-300 origin-bottom-right",
                    showSettings ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                )}>
                    <div className={cn(
                        "w-full max-w-sm flex flex-col bg-white/90 backdrop-blur-md rounded-2xl border border-stone-200 shadow-2xl p-6 gap-2",
                    )}>
                        <div className="flex items-center justify-center border-b border-stone-100 pb-2">
                             <h3 className="font-serif text-[#745e59] text-lg font-medium tracking-wide">⋆⭒˚.⋆ 𝒸𝓊𝓈𝓉𝑜𝓂𝒾𝓏𝑒 🪐 ⋆⭒˚</h3>
                        </div>
                        <div className="space-y-1">
                            {/* Filter Section */}
                            <div>
                                <h3 className="font-serif text-[#745e59] text-sm mb-2 text-center py-1">🪄𝒻𝒾𝓁𝓉𝑒𝓇⊹₊⟡⋆</h3>
                                <div className="flex flex-wrap gap-2 justify-center py-1" >
                                        {FILTERS.map((filter) => (
                                        <Button
                                        key={filter.id}
                                        variant={activeFilter === filter.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={cn(
                                            "font-serif text-xs px-2 h-7",
                                            activeFilter === filter.id ? "bg-[#745e59]" : "text-stone-600 border-stone-200"
                                        )}
                                        >
                                        {filter.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                
                            {/* Color Section */}
                            <div>
                                <h3 className="font-serif text-[#745e59] text-sm mb-2 text-center py-1">‧₊˚✩ 𝒸𝑜𝓁𝑜𝓇 ₊˚🫧⊹♡</h3>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {BACKGROUND_COLORS.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => setBackgroundColor(color.value)}
                                            className={cn(
                                                "w-6 h-6 rounded-full border-2 transition-all shadow-sm hover:scale-110 py-1",
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
                                <h3 className="font-serif text-[#745e59] text-sm mb-2 text-center py-1">𝓃𝑜𝓉𝑒 ✎𓂃</h3>
                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="𝓉𝓎𝓅𝑒 𝒽𝑒𝓇𝑒..."
                                        maxLength={20}
                                        className="w-full text-center bg-transparent border border-stone-200 rounded-md focus:border-[#745e59] focus:ring-1 focus:ring-[#745e59] outline-none px-3 py-1.5 font-serif text-[#745e59] placeholder:text-stone-300 transition-all text-sm"
                                    />
                                </div>
                            </div>

                             {/* Actions */}
                             <div className="pt-2 flex flex-col gap-2">
                                <Button 
                                    onClick={handleSave} 
                                    className="btn-minimal w-full py-5 text-base font-medium tracking-wide"
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? "Processing..." : "˚ ☁️⋅ 𝓅𝓇𝒾𝓃𝓉 & 𝓈𝒶𝓋𝑒 ♡‧₊"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <Button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn(
                        "btn-minimal w-14 h-14 transition-all duration-300 z-50 flex items-center justify-center p-0",
                        showSettings ? "btn-minimal-active rotate-90" : ""
                    )}
                >
                    {showSettings ? <X className="w-6 h-6" /> : <SlidersHorizontal className="w-6 h-6" />}
                </Button>
            </div>
        </>
      )}

      {/* Controls: PRINTING / SUCCESS MODE (Only in Printing Mode) */}
      {view === 'printing' && (
          <>
            {/* Back Button (Top Left) */}
            <Button 
                onClick={handleBackToSettings}
                className="btn-minimal fixed top-6 left-6 z-50 w-14 h-14 flex items-center justify-center p-0 animate-in fade-in duration-1000 delay-[3000ms]"
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>

            {/* Start New Session Button (Bottom Right) */}
            <Button 
                onClick={onRetake}
                className="btn-minimal fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center p-0 animate-in fade-in duration-1000 delay-[3000ms]"
            >
                <Home className="w-6 h-6" />
            </Button>
          </>
      )}

      </div>
    </div>
  );
}
