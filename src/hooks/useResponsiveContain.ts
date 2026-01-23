import { useState, useEffect } from 'react';

/**
 * Calculates a scale factor to contain a target width and height within the viewport,
 * with optional padding/margin percentage.
 * 
 * @param targetWidth The "natural" width of the content (px)
 * @param targetHeight The "natural" height of the content (px)
 * @param viewportPaddingPercentage Percentage of viewport to leave as padding (e.g. 0.1 for 10% buffering)
 */
export function useResponsiveContain(
  targetWidth: number,
  targetHeight: number,
  viewportPaddingPercentage: number = 0.1
) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calculateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Available space after padding
      const availableWidth = windowWidth * (1 - viewportPaddingPercentage);
      const availableHeight = windowHeight * (1 - viewportPaddingPercentage);

      // Ratios
      const widthRatio = availableWidth / targetWidth;
      const heightRatio = availableHeight / targetHeight;

      // Fit both
      const newScale = Math.min(widthRatio, heightRatio);

      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [targetWidth, targetHeight, viewportPaddingPercentage]);

  return scale;
}
