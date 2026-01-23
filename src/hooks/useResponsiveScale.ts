import { useState, useEffect } from 'react';

/**
 * Calculates a scale factor to fit a fixed-width element into a percentage of the viewport width.
 * 
 * @param targetContentWidth The fixed width of the content (in pixels) you want to scale.
 * @param screenPercentage The percentage of the screen width the content should occupy (0.0 - 1.0).
 * @param maxScale Optional maximum scale factor to preventing scaling up too much on huge screens.
 */
export function useResponsiveScale(
  targetContentWidth: number, 
  screenPercentage: number = 0.8,
  maxScale: number = 1.0
) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calculateScale = () => {
      const windowWidth = window.innerWidth;
      // Calculate how wide we want the content to be
      const desiredWidth = windowWidth * screenPercentage;
      // Calculate scale factor
      let newScale = desiredWidth / targetContentWidth;
      
      // Cap at maxScale if provided
      if (maxScale && newScale > maxScale) {
        newScale = maxScale;
      }
      
      setScale(newScale);
    };

    // Calculate initially
    calculateScale();

    // Recalculate on resize
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [targetContentWidth, screenPercentage, maxScale]);

  return scale;
}
