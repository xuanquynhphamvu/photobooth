'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutType } from "@/lib/photo-generator";

interface ReviewScreenProps {
  photos: string[];
  onRetake: () => void;
  onSave?: () => void; // Placeholder for now
}

type FilterType = 'none' | 'sepia' | 'bw' | 'vintage';

const FILTERS: { id: FilterType; name: string; class: string }[] = [
  { id: 'none', name: 'Normal', class: 'filter-none' },
  { id: 'sepia', name: 'Sepia', class: 'filter-sepia' },
  { id: 'bw', name: 'B&W', class: 'filter-bw' },
  { id: 'vintage', name: 'Vintage', class: 'filter-vintage' },
];

// Basic colors: Stone (Default), White, Zinc (Dark), Rose (Pink), Emerald (Mint), Sky (Blue), Amber (Yellow), Violet (Purple)
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

export function ReviewScreen({ photos, onRetake, onSave }: ReviewScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [backgroundColor, setBackgroundColor] = useState<string>(BACKGROUND_COLORS[0].value);
  const [layout, setLayout] = useState<LayoutType>('strip');
  const [isGenerating, setIsGenerating] = useState(false);

  const filterClass = FILTERS.find(f => f.id === activeFilter)?.class || 'filter-none';

  const handleSave = async () => {
    setIsGenerating(true);
    try {
        const { generateCompositeImage } = await import('@/lib/photo-generator');
        const dataUrl = await generateCompositeImage(photos, activeFilter, backgroundColor, layout);
        
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
    <div className="flex flex-col items-center justify-center min-h-[90vh] space-y-8 p-4 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-serif text-stone-900">Your Photos</h2>
        <p className="text-stone-600 font-serif italic">Select a style to apply</p>
      </div>

      {/* Photo Grid */}
      <div 
        className={cn(
            "grid gap-4 p-4 rounded-lg shadow-2xl rotate-1 transition-all duration-500 mx-auto",
            layout === 'strip' ? "grid-cols-1 max-w-sm" : "grid-cols-2 max-w-2xl"
        )}
        style={{ backgroundColor }}
      >
        {photos.map((photo, index) => (
          <div 
            key={index} 
            className="relative aspect-[4/3] overflow-hidden rounded bg-stone-100 animate-in fade-in zoom-in-95 duration-500 fill-mode-backwards"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`} 
              className={cn("w-full h-full object-cover transition-all duration-300", filterClass)} 
            />
          </div>
        ))}
      </div>

      {/* Layout Selection */}
      <div className="flex gap-4 justify-center bg-stone-100 p-1 rounded-lg inline-flex" role="group" aria-label="Layout Selection">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLayout('strip')}
            className={cn("font-serif rounded", layout === 'strip' && "bg-white shadow text-stone-900")}
          >
            Strip
          </Button>
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => setLayout('grid')}
            className={cn("font-serif rounded", layout === 'grid' && "bg-white shadow text-stone-900")}
          >
            Grid
          </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-4 flex-wrap justify-center" role="group" aria-label="Photo Filters">
        {FILTERS.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            onClick={() => setActiveFilter(filter.id)}
            aria-label={`Apply ${filter.name} filter`}
            aria-pressed={activeFilter === filter.id}
            className={cn(
                "min-w-[100px] font-serif transition-all",
                activeFilter === filter.id ? "bg-stone-900 text-white" : "border-stone-400 text-stone-700 hover:bg-stone-100"
            )}
          >
            {filter.name}
          </Button>
        ))}
      </div>

      {/* Color Selection */}
      <div className="space-y-2 text-center">
        <p className="text-stone-600 font-serif italic text-sm">Strip Color</p>
        <div className="flex gap-4 justify-center" role="group" aria-label="Background Color">
            {BACKGROUND_COLORS.map((color) => (
            <button
                key={color.id}
                onClick={() => setBackgroundColor(color.value)}
                aria-label={`Select ${color.label} background`}
                aria-pressed={backgroundColor === color.value}
                className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all shadow-sm hover:scale-110",
                    backgroundColor === color.value ? "border-stone-900 scale-110" : "border-transparent hover:border-stone-300"
                )}
                style={{ backgroundColor: color.value }}
                title={color.label}
            />
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-6 pt-4">
        <Button 
            onClick={onRetake} 
            variant="outline"
            size="lg"
            className="font-serif border-stone-800 text-stone-900 min-w-[160px]"
            disabled={isGenerating}
        >
          Retake
        </Button>
        <Button 
            onClick={handleSave} 
            size="lg"
            className="font-serif bg-stone-900 text-white hover:bg-stone-800 min-w-[160px]"
            disabled={isGenerating}
        >
          {isGenerating ? "Saving..." : "Save Photos"}
        </Button>
      </div>
    </div>
  );
}
