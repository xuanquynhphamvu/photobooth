'use client';

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Home, SlidersHorizontal, X, Printer } from "lucide-react";
import { LayoutType, generateCompositeImage } from "@/lib/photo-generator";
import { LAYOUT_CONFIG, getFormattedDate } from "@/lib/layout-config";

import { useResponsiveContain } from "@/hooks/useResponsiveContain";


interface ReviewScreenProps {
  photos: string[];
  onRetake: () => void;
  onBack: () => void;
  onSave?: () => void;
  initialLayout: LayoutType;
  isUpload?: boolean;
  photoOrientation?: 'portrait' | 'landscape';
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


export function ReviewScreen({ photos, onRetake, onBack, onSave, initialLayout, isUpload = false, photoOrientation }: ReviewScreenProps) {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
      setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
  }, []);
  
  // === UI SCALING FOR BUTTONS & PANEL ===
  const [uiScale, setUiScale] = useState(1);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const calculateUiScale = () => {
        // Base width for scaling: 1024px
        // Below 1024px: Scale = 1 (Mobile/Tablet default)
        // Above 1024px: Scale grows
        const width = window.innerWidth;
        const newScale = width < 1024 ? 1 : Math.max(1, width / 1024);
        setUiScale(newScale);
    };
    
    calculateUiScale();
    window.addEventListener('resize', calculateUiScale);
    return () => window.removeEventListener('resize', calculateUiScale);
  }, []);
  const [view, setView] = useState<'review' | 'printing'>('review');
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [backgroundColor, setBackgroundColor] = useState<string>(BACKGROUND_COLORS[0].value);
  const [layout] = useState<LayoutType>(initialLayout);
  const [note, setNote] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  // === DYNAMIC SCALING ===
  
  // Calculate Base Dimensions (Unscaled high-res pixels)
  // This mimics the structure of the generated image to preserve ratios
  const getBaseDimensions = () => {
    // If photoOrientation is provided (from Upload flow), use it to determine dimensions.
    // Otherwise use default "isPortrait" (from Window orientation) -> Wait, original code used window orientation?
    // "LAYOUT_CONFIG.getDimensions(isPortrait)" uses 480x640 vs 640x480.
    // The "isPortrait" state acts as a default if photoOrientation isn't provided (Camera flow).
    
    // For Camera flow: isPortrait is set by window.matchMedia.
    // For Upload flow: photoOrientation is passed.
    
    const targetIsPortrait = photoOrientation ? photoOrientation === 'portrait' : isPortrait;
    
    const { width: pW, height: pH } = LAYOUT_CONFIG.getDimensions(targetIsPortrait);
    const { padding, bottomBannerHeight } = LAYOUT_CONFIG;
    
    // Widths
    const stripWidth = pW + (padding * 2);
    const gridWidth = (pW * 2) + (padding * 3);
    
    const baseWidth = layout === 'strip' ? stripWidth : gridWidth;
    
    // Heights
    const cols = layout === 'strip' ? 1 : 2;
    const numPhotos = 4; // Default selection count
    const rows = Math.ceil(numPhotos / cols);
    
    // Height Calculation: 
    // Top Padding + (Rows * PhotoHeight) + (Gaps) + Banner + Bottom Padding?
    // In Generator: padding (top) + photos + gap + banner...
    // In CSS: Padding is applied to the container.
    // Total Height = (padding * 2) + (rows * pH) + ((rows - 1) * padding) + bottomBannerHeight
    // UPDATE: We added one extra padding unit to bottom in generator.
    const baseHeight = (padding * (rows + 1)) + (rows * pH) + ((rows - 1) * padding) + bottomBannerHeight;
    
    return { width: baseWidth, height: baseHeight, pW, pH, targetIsPortrait };
  };

  const baseDimensions = getBaseDimensions();
  const { padding } = LAYOUT_CONFIG;

  // 1. Review Mode Scaling: Constraint the Photo Strip/Grid to the viewport
  // We leave 15% padding (0.15) for UI controls (banners, buttons)
  const reviewScale = useResponsiveContain(baseDimensions.width, baseDimensions.height, 0.15);

  // 2. Printing Mode Scaling: Constraint the Camera Slot + Photo to the viewport
  // We need to fit:
  // - The Camera Slot Width (700px)
  // - The Total Height of the animation scene:
  //   The photo slides down to Y=492px. 
  //   The ending bottom position is 492px + PhotoHeight * (PrintingScale vs BaseScale)
  //   We approximate the bounding box by calculating the Photo Height in "Printing Units" (where width=300)
  
  const PRINTING_BASE_PHOTO_WIDTH_CONST = 300; 
  // Calculate the aspect ratio of the photo strip/grid
  const baseAspectRatio = baseDimensions.width / baseDimensions.height;
  // Calculate the height of the photo when its width is 300px
  const printingPhotoHeight = PRINTING_BASE_PHOTO_WIDTH_CONST / baseAspectRatio;
  
  // Total scene height = Top Offset + Photo Height + Bottom Margin
  const PRINTING_SCENE_HEIGHT = 492 + printingPhotoHeight + 50; 
  const PRINTING_SCENE_WIDTH = 700; // Camera width

  const printingScale = useResponsiveContain(PRINTING_SCENE_WIDTH, PRINTING_SCENE_HEIGHT, 0.1); 

  // Determine active target width based on View
  // For Review: scale * baseWidth
  // For Printing: Fixed Base (700 for camera, 300 for photo relative base) -> applied via transform
  
  // REVIEW MODE: We scale the internal properties (targetWidth)
  // PRINTING MODE: We scale the external container (transform), internal props stay fixed at "Print Base"
  
  const PRINTING_BASE_PHOTO_WIDTH = 300; 
  const PRINTING_BASE_CAMERA_WIDTH = 700;

  const targetWidth = view === 'printing' 
    ? PRINTING_BASE_PHOTO_WIDTH 
    : baseDimensions.width * reviewScale;

  const targetCameraWidth = view === 'printing' 
    ? PRINTING_BASE_CAMERA_WIDTH 
    : 0; // Not used in review

  const CANVAS_WIDTH = baseDimensions.width;
  
  // Internal Scale Factor (drives padding, border-radius, font-size)
  // In Review Mode: scale varies with screen size.
  // In Printing Mode: scale is relative to the PRINTING_BASE_PHOTO_WIDTH vs CANVAS_WIDTH.
  const scale = targetWidth / CANVAS_WIDTH;
  
  // Default selection based on layout
  const defaultSelectionCount = 4;
  const [selectedPhotos] = useState<string[]>(photos.slice(0, defaultSelectionCount));
  const [isGenerating, setIsGenerating] = useState(false);



  const filterClass = FILTERS.find(f => f.id === activeFilter)?.class || 'filter-none';

  const downloadPhoto = async () => {
    setIsGenerating(true);
    // Calcluate aspect ratio for "review" usage if needed, but generator needs raw dims?
    // Generator takes "isPortrait" boolean OR we can pass explicit dimensions.
    // Let's pass the calculated dimensions.
    
    try {
        const dataUrl = await generateCompositeImage(selectedPhotos, activeFilter, backgroundColor, layout, note, baseDimensions.targetIsPortrait);
        
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

  const settingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSettingsEnter = () => {
    if (settingsTimeoutRef.current) {
        clearTimeout(settingsTimeoutRef.current);
        settingsTimeoutRef.current = null;
    }
    setShowSettings(true);
  };

  const handleSettingsLeave = () => {
    settingsTimeoutRef.current = setTimeout(() => {
        setShowSettings(false);
    }, 500);
  };

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
            ? "absolute top-10 left-1/2 origin-top" 
            : "origin-center"
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
            <div className="relative z-40 overflow-hidden px-6 pb-6 pt-0" style={{ transform: view === 'printing' ? 'translateY(492px) translateX(5px)' : 'translateY(0px)' }}>
            <div 
            className={cn(
                "flex flex-col shadow-sm mx-auto bg-stone-50 relative",
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
                transition: view === 'printing' ? 'none' : 'transform 0.5s',
                gap: padding * scale // Match generator's bottom padding between grid and banner
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
                        baseDimensions.targetIsPortrait ? "aspect-[3/4]" : "aspect-[4/3]"
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
            {/* Back Button (Top Left) */}
            <Button 
                onClick={onBack}
                aria-label="Back"
                className="btn-minimal fixed top-6 left-6 z-50 w-14 h-14 flex items-center justify-center p-0"
                style={{ transform: `scale(${uiScale})`, transformOrigin: 'top left' }}
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>
            {/* Toggle Button */}
            <div 
                className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
                style={{ transform: `scale(${uiScale})`, transformOrigin: 'bottom right' }}
            >
                <div 
                    className={cn(
                        "transition-all duration-300 origin-bottom-right",
                        showSettings ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                    )}
                    onMouseEnter={handleSettingsEnter}
                    onMouseLeave={handleSettingsLeave}
                >
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
                                    className="btn-minimal w-[80%] mx-auto py-5 text-base font-medium tracking-wide origin-center"
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
                    onMouseEnter={handleSettingsEnter}
                    onMouseLeave={handleSettingsLeave}
                    className={cn(
                        "btn-minimal w-14 h-14 transition-all duration-300 z-50 flex items-center justify-center p-0",
                        showSettings ? "btn-minimal-active rotate-90" : ""
                    )}
                >
                    {showSettings ? <X className="w-6 h-6" /> : <SlidersHorizontal className="w-6 h-6" />}
                </Button>

                <Button 
                    onClick={handleSave} 
                    className={cn(
                        "btn-minimal w-14 h-14 z-50 flex items-center justify-center p-0 transition-all duration-300",
                    )}
                    disabled={isGenerating}
                    title="Print & Save"
                >
                    <Printer className="w-6 h-6" />
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
                style={{ transform: `scale(${uiScale})`, transformOrigin: 'top left' }}
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>

            {/* Start New Session Button (Bottom Right) */}
            <Button 
                onClick={onRetake}
                className="btn-minimal fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center p-0 animate-in fade-in duration-1000 delay-[3000ms]"
                style={{ transform: `scale(${uiScale})`, transformOrigin: 'bottom right' }}
            >
                <Home className="w-6 h-6" />
            </Button>
          </>
      )}

      </div>
    </div>
  );
}
