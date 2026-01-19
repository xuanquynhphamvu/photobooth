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
  { id: 'none', name: 'Normal', class: 'filter-none' },
  { id: 'sepia', name: 'Sepia', class: 'filter-sepia' },
  { id: 'bw', name: 'B&W', class: 'filter-bw' },
  { id: 'vintage', name: 'Vintage', class: 'filter-vintage' },
];

const BACKGROUND_COLORS = [
  { id: 'stone', value: '#f5f5f4', label: 'Stone' },
  { id: 'white', value: '#ffffff', label: 'White' },
  { id: 'dark', value: '#1c1917', label: 'Dark' },
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
        const dataUrl = await generateCompositeImage(selectedPhotos, activeFilter, backgroundColor, layout);
        
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
    <div className="flex flex-col lg:flex-row h-screen max-w-7xl mx-auto overflow-hidden bg-white/50 backdrop-blur-sm shadow-xl rounded-xl border border-stone-200">
      
      {/* Left Panel - Preview */}
      <div className="w-full lg:w-3/5 p-8 bg-stone-50 flex flex-col items-center justify-center overflow-y-auto min-h-[50vh]">
        <div className="mb-6 text-center lg:hidden">
            <h2 className="text-2xl font-serif text-stone-900">Preview</h2>
        </div>
        
        <div 
          className={cn(
              "grid gap-4 p-6 rounded-lg shadow-2xl transition-all duration-500 mx-auto",
              layout === 'strip' ? "grid-cols-1 w-[320px]" : "grid-cols-2 w-[480px]"
          )}
          style={{ backgroundColor }}
        >
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
      </div>

      {/* Right Panel - Controls */}
      <div className="w-full lg:w-2/5 p-6 bg-white flex flex-col gap-6 overflow-y-auto border-l border-stone-100">
        
        <div>
            <h3 className="text-lg font-serif font-medium text-stone-900 mb-3">
                1. Select Photos <span className="text-stone-500 font-normal">({selectedPhotos.length}/{layout === 'strip' ? 3 : 4})</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => {
                    const isSelected = selectedPhotos.includes(photo);
                    const selectedIndex = selectedPhotos.indexOf(photo) + 1;
                    
                    return (
                        <button
                            key={index}
                            onClick={() => togglePhoto(photo)}
                            className={cn(
                                "relative aspect-[4/3] rounded overflow-hidden transition-all duration-200",
                                isSelected ? "ring-2 ring-stone-900 ring-offset-2 opacity-100" : "opacity-50 hover:opacity-80 grayscale"
                            )}
                        >
                            <img 
                                src={photo} 
                                alt={`Capture ${index + 1}`} 
                                className="w-full h-full object-cover" 
                            />
                            {isSelected && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                    {selectedIndex}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="h-px bg-stone-100" />

        <div className="h-px bg-stone-100" />


        <div>
            <h3 className="text-lg font-serif font-medium text-stone-900 mb-3">3. Style</h3>
            
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-stone-500 font-serif block mb-2">Filter</label>
                    <div className="flex flex-wrap gap-2">
                         {FILTERS.map((filter) => (
                          <Button
                            key={filter.id}
                            variant={activeFilter === filter.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFilter(filter.id)}
                            className={cn(
                                "font-serif",
                                activeFilter === filter.id ? "bg-stone-900" : "text-stone-600"
                            )}
                          >
                            {filter.name}
                          </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-sm text-stone-500 font-serif block mb-2">Background</label>
                    <div className="flex flex-wrap gap-3">
                        {BACKGROUND_COLORS.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => setBackgroundColor(color.value)}
                                className={cn(
                                    "w-8 h-8 rounded-full border-2 transition-all shadow-sm hover:scale-110",
                                    backgroundColor === color.value ? "border-stone-900 scale-110" : "border-stone-200 hover:border-stone-300"
                                )}
                                style={{ backgroundColor: color.value }}
                                title={color.label}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-auto pt-6 flex gap-3">
             <Button 
                onClick={onRetake} 
                variant="outline"
                className="flex-1 font-serif border-stone-200 text-stone-600 hover:bg-stone-50"
                disabled={isGenerating}
            >
              Retake
            </Button>
            <Button 
                onClick={handleSave} 
                className="flex-[2] font-serif bg-stone-900 text-white hover:bg-stone-800"
                disabled={isGenerating}
            >
              {isGenerating ? "Processing..." : "Save & Download"}
            </Button>
        </div>
      </div>
    </div>
  );
}
