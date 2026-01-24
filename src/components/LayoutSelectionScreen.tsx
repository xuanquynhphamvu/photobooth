import React from 'react';
import { LayoutType } from "@/lib/photo-generator";

interface LayoutSelectionScreenProps {
  onSelectLayout: (layout: LayoutType, isPortrait: boolean) => void;
}

export function LayoutSelectionScreen({ onSelectLayout }: LayoutSelectionScreenProps) {
  return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl mx-auto">
          
          {/* Option 1: Portrait Strip */}
          <button
            onClick={() => onSelectLayout('strip', true)}
            className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white border-2 border-stone-200 hover:border-[#745e59] transition-all duration-300 hover:shadow-xl w-full"
          >
            <div className="flex items-center justify-center w-full">
              <div className="w-full max-w-[32px] md:max-w-[35px] bg-stone-100 p-1 md:p-1.5 shadow-inner rounded-sm group-hover:scale-105 transition-transform duration-300">
                <div className="flex flex-col gap-0.5 md:gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full aspect-[3/4] bg-stone-300 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center space-y-0.5 shrink-0">
              <h3 className="font-serif font-medium text-[#745e59] text-sm md:text-base">𝓅𝑜𝓇𝓉𝓇𝒶𝒾𝓉 𝓈𝓉𝓇𝒾𝓅</h3>
            </div>
          </button>

          {/* Option 2: Landscape Strip */}
          <button
            onClick={() => onSelectLayout('strip', false)}
            className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white border-2 border-stone-200 hover:border-[#745e59] transition-all duration-300 hover:shadow-xl w-full"
          >
            <div className="flex items-center justify-center w-full">
              <div className="w-full max-w-[50px] md:max-w-[55px] bg-stone-100 p-1 md:p-1.5 shadow-inner rounded-sm group-hover:scale-105 transition-transform duration-300">
                <div className="flex flex-col gap-0.5 md:gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full aspect-[4/3] bg-stone-300 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>
             <div className="text-center space-y-0.5 shrink-0">
              <h3 className="font-serif font-medium text-[#745e59] text-sm md:text-base">𝓁𝒶𝓃𝒹𝓈𝒸𝒶𝓅𝑒 𝓈𝓉𝓇𝒾𝓅</h3>
            </div>
          </button>

          {/* Option 3: Portrait Grid */}
          <button
            onClick={() => onSelectLayout('grid', true)}
            className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white border-2 border-stone-200 hover:border-[#745e59] transition-all duration-300 hover:shadow-xl w-full"
          >
             <div className="flex items-center justify-center w-full">
               <div className="w-full max-w-[76px] md:max-w-[106px] bg-stone-100 p-1 md:p-1.5 shadow-inner rounded-sm group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-0.5 md:gap-1 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full aspect-[3/4] bg-stone-300 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center space-y-0.5 shrink-0">
              <h3 className="font-serif font-medium text-[#745e59] text-sm md:text-base">𝓅𝑜𝓇𝓉𝓇𝒶𝒾𝓉 𝑔𝓇𝒾𝒹</h3>
            </div>
          </button>

           {/* Option 4: Landscape Grid */}
           <button
            onClick={() => onSelectLayout('grid', false)}
            className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white border-2 border-stone-200 hover:border-[#745e59] transition-all duration-300 hover:shadow-xl w-full"
          >
             <div className="flex items-center justify-center w-full">
               <div className="w-full max-w-[130px] md:max-w-[180px] bg-stone-100 p-1 md:p-1.5 shadow-inner rounded-sm group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-0.5 md:gap-1 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full aspect-[4/3] bg-stone-300 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center space-y-0.5 shrink-0">
              <h3 className="font-serif font-medium text-[#745e59] text-sm md:text-base">𝓁𝒶𝓃𝒹𝓈𝒸𝒶𝓅𝑒 𝑔𝓇𝒾𝒹</h3>
            </div>
          </button>
        </div>

      </div>
  );
}
