'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ZoomIn } from "lucide-react";

interface DraggablePhotoProps {
  src: string;
  zoom: number;
  pan: { x: number; y: number };
  onUpdate: (zoom: number, pan: { x: number; y: number }) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function DraggablePhoto({ src, zoom, pan, onUpdate, className, style }: DraggablePhotoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [imgSize, setImgSize] = useState<{ width: number, height: number } | null>(null);
  
  // Drag state
  const dragStartRef = useRef<{ x: number, y: number, initialPan: { x: number, y: number } } | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setImgSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Calculate Constraints
  const constraints = useMemo(() => {
    if (!containerRef.current || !imgSize) return null;
    const { width: cW, height: cH } = containerRef.current.getBoundingClientRect();
    if (cW === 0 || cH === 0) return null; // Not ready

    const imgRatio = imgSize.width / imgSize.height;
    const containerRatio = cW / cH;

    // Calculate "Cover" Dimensions (Base Size at Zoom=1)
    let baseW, baseH;
    if (imgRatio > containerRatio) {
        // Image is Wider: Match Height
        baseH = cH;
        baseW = cH * imgRatio;
    } else {
        // Image is Taller: Match Width
        baseW = cW;
        baseH = cW / imgRatio;
    }

    // Scaled Size
    const scaledW = baseW * zoom;
    const scaledH = baseH * zoom;

    // Max Pan (in Pixels) from Center
    // If scaledW > cW, we can move (scaledW - cW) / 2 in either direction.
    const maxPxX = Math.max(0, (scaledW - cW) / 2);
    const maxPxY = Math.max(0, (scaledH - cH) / 2);

    // Convert pixels back to 'Percentage of BASE DIMENSION' or 'Percentage of CONTAINER'?
    // Our shared state convention in ReviewScreen/Generator is:
    // Translate(pan.x * 100%, pan.y * 100%)
    // But what is 100% relative to?
    // In CSS `translate(%)` on an element refers to the element's OWN width/height.
    // In Generator, we implemented: ctx.translate(pan.x * photoWidth, pan.y * photoHeight).
    // `photoWidth` is the CONTAINER (Cell) width.
    // So `pan.x` = 1.0 means shift by 1 full Container Width.
    
    // So, maxPanX (percentage) = maxPxX / cW.
    
    return {
        maxPanX: maxPxX / cW,
        maxPanY: maxPxY / cH,
        baseW, 
        baseH
    };
  }, [imgSize, zoom, pan /* re-calc if container changes size? */]); // We might need resize observer

  // Resize Observer for Container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
        // Trigger re-calc
        // We can just force update or let imgSize trigger it if we stored container size.
        // Let's just set a dummy state to force re-render/re-calc
        setImgSize(prev => prev ? {...prev} : null);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    setIsDragging(true);
    dragStartRef.current = {
        x: clientX,
        y: clientY,
        initialPan: { ...pan }
    };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current || !constraints) return;

    // Prevent default touch actions (scroll)
    // if (e.cancelable && 'touches' in e) e.preventDefault(); 
    // ^ Can't do this in passive listener easily, but touch-action: none covers it.

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // Convert Delta (Pixels) -> Delta (Percentage of Container)
    const deltaPanX = deltaX / width;
    const deltaPanY = deltaY / height;

    let newX = dragStartRef.current.initialPan.x + deltaPanX;
    let newY = dragStartRef.current.initialPan.y + deltaPanY;

    // Apply strict bounds
    newX = Math.max(-constraints.maxPanX, Math.min(constraints.maxPanX, newX));
    newY = Math.max(-constraints.maxPanY, Math.min(constraints.maxPanY, newY));

    onUpdate(zoom, { x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleZoomChange = (vals: number[]) => {
      // When zooming, we must ensure the current Pan is still valid!
      // But wait, the parent updates the zoom.
      // We should calculate the Valid Pan for the NEW Zoom effectively?
      // Or just pass the new zoom, and let the next render clamp it?
      // If we pass new zoom, the constraints won't update until next render.
      // We can update zoom, and rely on `useEffect` to clamp?
      // Better: Clamp immediately inside the callback.
      // Wait, we need the *Constraints for the New Zoom*.
      // We can approximate or just let it update.
      // User experience: If I zoom out, and I was panned far edge, I should snap back.
      // Let's implement a listener for props change to snap back?
      
      onUpdate(vals[0], pan);
  };
  
  // Snap back effect when constraints change (e.g. Zoom Out)
  useEffect(() => {
      if (!isDragging && constraints) {
          let newX = pan.x;
          let newY = pan.y;
          let changed = false;

          if (Math.abs(newX) > constraints.maxPanX + 0.001) { // epsilon
              newX = Math.sign(newX) * constraints.maxPanX;
              changed = true;
          }
          if (Math.abs(newY) > constraints.maxPanY + 0.001) {
              newY = Math.sign(newY) * constraints.maxPanY;
              changed = true;
          }

          if (changed) {
              onUpdate(zoom, { x: newX, y: newY });
          }
      }
  }, [zoom, constraints?.maxPanX, constraints?.maxPanY, isDragging]);


  return (
    <div 
        ref={containerRef}
        className={cn("relative overflow-hidden cursor-grab active:cursor-grabbing group select-none touch-none", className)}
        style={style}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={() => {
            handlePointerUp();
            setIsHovering(false);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
    >
        {/* The Image */}
        {/* We use a specific display logic now: 
            1. Center the logic container.
            2. Size it to "Base Cover Size".
            3. Apply Pan/Zoom transforms. 
            This ensures that zoom scales from center, and pan moves relative to that.
        */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                ref={imgRef}
                src={src} 
                alt="Photo"
                onLoad={handleImageLoad}
                className="max-w-none origin-center will-change-transform" // Remove w-full/h-full, we control size manually
                style={{
                    // If we haven't calculated size yet, hiding it or using w-full as fallback might be good.
                    // But `constraints.baseW` won't exist yet. Fallback to object-cover?
                    // Let's transition from opacity 0?
                    width: constraints ? constraints.baseW : '100%',
                    height: constraints ? constraints.baseH : '100%',
                    // Fallback to object-cover if constraints missing (initial load)
                    objectFit: constraints ? undefined : 'cover', 
                    
                    transform: `translate(${pan.x * 100}%, ${pan.y * 100}%) scale(${zoom})`,
                    // We need to apply translation in specific order?
                    // "Translate %" refers to element size.
                    // Our pan is "Percentage of CONTAINER".
                    // But here on the element, `translate(100%)` moves it by ITS OWN WIDTH.
                    // Current `baseW` might be larger than Container.
                    // So `translate(pan.x * 100%)` moves it by `pan.x * baseW`.
                    // But we want to move by `pan.x * containerWidth`.
                    
                    // CORRECTION:
                    // Pan state is "Percentage of Container".
                    // We need to translate by `pan.x * containerWidth` pixels.
                    // We can use Calc? `calc(pan.x * 100cqw)`? No, container query units support varies.
                    // We can use Pixels since we have `constraints.baseW`.
                    // Let's pass pixels in style if we can access container dimensions.
                    // Or change the TRANSFORM logic to use pixels if we have them.
                    
                    // If we use pixels: `translate(${pan.x * props.width}px, ...)`
                    // But we don't have container width in render easily without state.
                    // We do have it in `constraints` logic.
                    // Let's rely on the `containerRef.current.offsetWidth` if available, or stay with % if ratio is 1:1.
                    
                    // Actually, let's keep it simple: Use PIXELS in state for Render?
                    // No, `onUpdate` uses normalized %.
                    
                    // FIX:
                    // `translate(Xpx, Ypx)` is safest.
                    // We can derive Xpx = pan.x * (containerWidth).
                    // We can verify `containerWidth` from constraints calculation logic?
                    // `baseW` was derived from `cW`.
                    // `baseW = cW * ratio` (if wider) or `baseW = cW` (if taller).
                    // So `cW` can be derived or we can just capture it in `constraints`.
                }}
            />
            {/* Since we can't easily put logic in the style prop block without clutter, 
                let's wrap image or use effect to set style? No.
                Let's just use a dedicated rendered element style.
            */}
        </div>
        
        {/* Render again with corrected style logic */}
        {(() => {
             // Logic to fix the translation unit issue
             // If pan.x = 1 (100% container), we want translation of C_WIDTH.
             // CSS translate(100%) on image moves it by IMG_WIDTH.
             // Ratio = C_WIDTH / IMG_WIDTH.
             // We want translate( pan.x * 100 * Ratio % ).
             
             let translateX = '0px';
             let translateY = '0px';
             
             if (constraints && containerRef.current) {
                 const cw = containerRef.current.clientWidth;
                 const ch = containerRef.current.clientHeight;
                 translateX = `${pan.x * cw}px`;
                 translateY = `${pan.y * ch}px`;
             }
             
             return (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={src}
                        // Reuse ref? No, duplicate logic just for the 'return' is messy.
                        // Let's move this render block up.
                        // Ignoring this block, will apply style to the main img above.
                        className="hidden" 
                    />
                 </div>
             )
        })()}

        <style jsx>{`
            .custom-photo-transform {
                transform: translate(var(--tx), var(--ty)) scale(var(--s));
            }
        `}</style>
        
        {/* REAL IMAGE RENDER */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
                src={src}
                ref={imgRef}
                onLoad={handleImageLoad}
                className="max-w-none origin-center will-change-transform"
                style={{
                    width: constraints ? constraints.baseW : '100%',
                    height: constraints ? constraints.baseH : '100%',
                    objectFit: constraints ? undefined : 'cover',
                    
                    // Use CSS variables for cleaner calc or just inline pixel string
                    transform: constraints && containerRef.current 
                        ? `translate(${pan.x * containerRef.current.clientWidth}px, ${pan.y * containerRef.current.clientHeight}px) scale(${zoom})`
                        : `scale(${zoom})`, // Fallback
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
             />
        </div>


        {/* Overlay Controls (Slider) */}
        <div 
            className={cn(
                "absolute bottom-2 left-1/2 -translate-x-1/2 w-[80%] max-w-[120px] transition-all duration-300 z-10 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20",
                (isHovering || isDragging) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            )}
            onMouseDown={(e) => e.stopPropagation()} 
            onTouchStart={(e) => e.stopPropagation()}
        >
            <ZoomIn className="w-3 h-3 text-white/80 flex-shrink-0" />
            <Slider 
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={handleZoomChange}
                className="flex-1 h-4"
            />
        </div>
        
    </div>
  );
}
