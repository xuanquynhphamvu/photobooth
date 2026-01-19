import React from 'react';
import { LayoutType } from "@/lib/photo-generator";

interface LayoutSelectionScreenProps {
  onSelectLayout: (layout: LayoutType) => void;
}

export function LayoutSelectionScreen({ onSelectLayout }: LayoutSelectionScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 p-4">
      <div className="max-w-4xl w-full space-y-12 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 tracking-tight">
            Choose Your Layout
          </h1>
          <p className="text-stone-500 font-serif text-lg">
            Select how you want your photos to be arranged
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Option 1: Photo Strip */}
          <button
            onClick={() => onSelectLayout('strip')}
            className="group relative flex flex-col items-center gap-6 p-8 rounded-xl bg-white border-2 border-stone-200 hover:border-stone-900 transition-all duration-300 hover:shadow-xl"
          >
            <div className="w-32 bg-stone-100 p-2 shadow-inner rounded-sm group-hover:scale-105 transition-transform duration-300">
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full aspect-[4/3] bg-stone-300 rounded-sm" />
                ))}
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-serif font-medium text-stone-900">Photo Strip</h3>
              <p className="text-sm text-stone-500">Classic 3-photo vertical strip</p>
            </div>
          </button>

          {/* Option 2: 2x2 Grid */}
          <button
            onClick={() => onSelectLayout('grid')}
            className="group relative flex flex-col items-center gap-6 p-8 rounded-xl bg-white border-2 border-stone-200 hover:border-stone-900 transition-all duration-300 hover:shadow-xl"
          >
             <div className="w-48 bg-stone-100 p-2 shadow-inner rounded-sm group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-2 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full aspect-[4/3] bg-stone-300 rounded-sm" />
                ))}
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-serif font-medium text-stone-900">Photo Grid</h3>
              <p className="text-sm text-stone-500">Modern 4-photo square grid</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
