export type LayoutType = 'grid' | 'strip';

export async function generateCompositeImage(photos: string[], filter: FilterType, backgroundColor: string = '#f5f5f4', layout: LayoutType = 'strip', note?: string): Promise<string> {
  if (photos.length === 0) throw new Error("No photos to generate image from");

  // Create a canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  // Settings
  const photoWidth = 640;
  const photoHeight = 480;
  const padding = 40;
  const bottomBannerHeight = 100;
  
  const cols = layout === 'grid' ? 2 : 1;
  const rows = Math.ceil(photos.length / cols);

  // Calculate canvas size
  canvas.width = (photoWidth * cols) + (padding * (cols + 1));
  canvas.height = (photoHeight * rows) + (padding * (rows + 1)) + bottomBannerHeight;

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply Filter to Context
  // ctx.filter is supported in most modern browsers
  let filterString = 'none';
  switch (filter) {
    case 'sepia':
      filterString = 'sepia(0.8) contrast(1.2)';
      break;
    case 'bw':
      filterString = 'grayscale(1) contrast(1.1)';
      break;
    case 'vintage':
      filterString = 'sepia(0.4) saturate(1.5) contrast(0.9) brightness(1.1)';
      break;
  }
  ctx.filter = filterString;

  // Draw Photos
  const loadImages = photos.map(src => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  });

  const images = await Promise.all(loadImages);

  images.forEach((img, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + (col * (photoWidth + padding));
    const y = padding + (row * (photoHeight + padding));
    
    // Draw white border/frame around photo
    // We need to reset filter for the border if we wanted it crisp, but sticking to simple for now
    // Actually, let's draw the image
    ctx.drawImage(img, x, y, photoWidth, photoHeight);
  });

  // Reset filter for text/branding
  ctx.filter = 'none';

  // Branding
  // Simple contrast check: if background is dark, use light text.
  // This is a naive heuristic (checking for black or dark hex/rgb would be better),
  // but for our presets we can just default to a smart choice or check specific values.
  // For now, let's assume if it's black or the vintage dark (#745e59) we want white text.
  const isDark = backgroundColor === '#000000' || backgroundColor === '#1c1917' || backgroundColor === '#745e59';
  
  ctx.fillStyle = isDark ? '#f5f5f4' : '#1c1917'; // stone-100 vs stone-900
  ctx.font = 'bold 48px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const centerX = canvas.width / 2;
  const contentBottom = (photoHeight * rows) + (padding * (rows + 1));
  const bannerCenterY = contentBottom + (bottomBannerHeight / 2) - 10; 

  const titleText = note && note.trim().length > 0 ? note : null;
  
  if (titleText) {
      ctx.fillText(titleText, centerX, bannerCenterY);
  } else {
      // Draw Logo
      const logoPromise = new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = '/melphotobooth.svg';
      });

      try {
          const logo = await logoPromise;
          
          // Calculate Logo Dimensions (maintain aspect ratio)
          // Original ViewBox: 0 0 375 75 -> Ratio: 5:1
          const logoHeight = 50; 
          const logoWidth = logoHeight * (logo.width / logo.height) || logoHeight * 5; 
          
          const logoX = centerX - (logoWidth / 2);
          const logoY = bannerCenterY - (logoHeight / 2);

          // If dark background, invert logo to make it white (assuming logo is dark/brown)
          if (isDark) {
             ctx.filter = 'brightness(0) invert(1)';
          }

          // Add shadow
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
          
          // Reset shadow and filter
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.filter = 'none';
      } catch (e) {
          console.error("Failed to load logo", e);
          // Fallback to text if logo fails
          ctx.fillText('Photobooth', centerX, bannerCenterY);
      }
  }
  
  ctx.font = 'italic 24px "Playfair Display", serif';
  ctx.fillStyle = isDark ? '#a8a29e' : '#57534e'; // stone-400 vs stone-600
  const dateStr = new Date().toLocaleDateString();
  ctx.fillText(dateStr, centerX, bannerCenterY + 40);

  return canvas.toDataURL('image/jpeg', 0.9);
}
