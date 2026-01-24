import { LAYOUT_CONFIG, getFormattedDate } from "./layout-config";

export type LayoutType = 'grid' | 'strip';
export type FilterType = 'none' | 'sepia' | 'bw' | 'vintage';

export async function generateCompositeImage(photos: string[], filter: FilterType, backgroundColor: string = '#f5f5f4', layout: LayoutType = 'strip', note?: string, isPortrait: boolean = false, photoEdits?: Record<number, { zoom: number; pan: { x: number; y: number } }>): Promise<string> {
  if (photos.length === 0) throw new Error("No photos to generate image from");

  // Create a canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  // Settings from Config
  const { padding, bottomBannerHeight, logoHeight, gap, titleFontSize, dateFontSize } = LAYOUT_CONFIG;
  const { width: photoWidth, height: photoHeight } = LAYOUT_CONFIG.getDimensions(isPortrait);
  
  const cols = layout === 'grid' ? 2 : 1;
  const rows = Math.ceil(photos.length / cols);

  // Calculate canvas size
  // rows + 1 padding would include a bottom padding. We remove the bottom padding to tighten the footer space.
  canvas.width = (photoWidth * cols) + (padding * (cols + 1));
  canvas.height = (photoHeight * rows) + (padding * rows) + padding + bottomBannerHeight; 
  // Wait, `padding * rows` for 1 row = 40. That's top padding.
  // For 2 rows = 80. Top + Mid.
  // So using `padding * (rows + 1)` was Top + Mid + Bottom.
  // We want to remove Bottom. So `padding * rows` is Top + Mid? 
  // Wait.
  // Row 0 Y = padding.
  // Row 1 Y = padding + height + padding.
  // Height after Row 1 = padding + height + padding + height.
  // This is `height*2 + padding*2`.
  // `rows=2`. `padding*2` matches.
  
  // So yes, `padding * rows` covers Top + Mid.
  // BUT `canvas.height` needs to cover `top` padding as well? 
  // `padding * rows` IS `top + mid` for `cols=1`.
  // Let's re-verify. rows=1. `padding * 1` = 40. Correct (Top).
  // rows=2. `padding * 2` = 80. Correct (Top + Mid).
  
  // So `canvas.height = (photoHeight * rows) + (padding * rows) + bottomBannerHeight` is correct.
  // Add one extra padding for the bottom of the photo section (before banner)
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
    
    // Draw photo with Zoom and Pan
    const edit = photoEdits?.[i] || { zoom: 1, pan: { x: 0, y: 0 } };
    const { zoom, pan } = edit;

    // 1. Calculate base "cover" dimensions
    // This is the size the image would be to exactly cover the cell (like object-fit: cover)
    const imgRatio = img.width / img.height;
    const targetRatio = photoWidth / photoHeight;
    
    let drawW, drawH;

    if (imgRatio > targetRatio) {
      // Image is wider: Height is constraint
      drawH = photoHeight;
      drawW = photoHeight * imgRatio;
    } else {
      // Image is taller: Width is constraint
      drawW = photoWidth;
      drawH = photoWidth / imgRatio;
    }

    // 2. Apply Transforms
    ctx.save();
    
    // Clip to the cell
    ctx.beginPath();
    ctx.rect(x, y, photoWidth, photoHeight);
    ctx.clip();
    
    // Move to Center of Cell
    ctx.translate(x + photoWidth / 2, y + photoHeight / 2);
    
    // Apply User Pan (Relative to cell dimensions)
    ctx.translate(pan.x * photoWidth, pan.y * photoHeight);
    
    // Apply User Zoom
    ctx.scale(zoom, zoom);
    
    // Draw Image Centered (offset by simple half-size)
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    
    ctx.restore();
  });

  // Reset filter for text/branding
  ctx.filter = 'none';

  // Branding
  const isDark = backgroundColor === '#000000' || backgroundColor === '#1c1917' || backgroundColor === '#745e59';
  const dateStr = getFormattedDate();
  
  ctx.fillStyle = isDark ? LAYOUT_CONFIG.colors.textOnDark : LAYOUT_CONFIG.colors.textOnLight;
  
  const centerX = canvas.width / 2;
  // contentBottom matches the height calculation above (start of banner)
  // contentBottom starts after the photos + all paddings (including the new bottom padding)
  const contentBottom = (photoHeight * rows) + (padding * (rows + 1));
  
  // Dynamic Group Centering
  // We want to center the group [Logo + Gap + Date] vertically in the banner
  const totalContentHeight = logoHeight + gap + dateFontSize;
  const groupStartY = contentBottom + (bottomBannerHeight - totalContentHeight) / 2;
  
  // Center adjustments for text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top'; // Use top baseline for easier vertical stacking calculations

  const titleText = note && note.trim().length > 0 ? note : null;
  
  if (titleText) {
      // If note exists, it replaces the logo. We center it similarly.
      // Note is usually single line, so let's treat it like the logo block
      ctx.font = `bold ${titleFontSize}px "Playfair Display", serif`;
      // Recalculate group height with title instead of logo? 
      // Title is ~80px, Logo is 100px. Let's stick to the same groupStartY for consistency or re-calc.
      // Let's re-calc for perfection:
      const noteGroupHeight = titleFontSize + gap + dateFontSize;
      const noteStartY = contentBottom + (bottomBannerHeight - noteGroupHeight) / 2;
      
      ctx.fillText(titleText, centerX, noteStartY);
      
      // Draw Date below Note
      ctx.font = `italic ${dateFontSize}px "Playfair Display", serif`;
      ctx.fillStyle = isDark ? '#a8a29e' : '#57534e'; 
      ctx.fillText(dateStr, centerX, noteStartY + titleFontSize + gap);

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
          
          // Calculate Logo Dimensions based on Config height
          const logoWidth = logoHeight * (logo.width / logo.height) || logoHeight * 5; 
          
          const logoX = centerX - (logoWidth / 2);
          const logoY = groupStartY; // Top of logo

          // Dark/Brown BG -> Cream #e6dbc6
          // Light BG -> Brown #745e59
          const targetColor = isDark ? '#e6dbc6' : '#745e59';

          // Use an offscreen canvas to tint the logo
          const offscreen = document.createElement('canvas');
          offscreen.width = logoWidth;
          offscreen.height = logoHeight;
          const offCtx = offscreen.getContext('2d');
          
          if (offCtx) {
              offCtx.drawImage(logo, 0, 0, logoWidth, logoHeight);
              offCtx.globalCompositeOperation = 'source-in';
              offCtx.fillStyle = targetColor;
              offCtx.fillRect(0, 0, logoWidth, logoHeight);
              
              // Draw targeted logo
              ctx.drawImage(offscreen, logoX, logoY, logoWidth, logoHeight);
          } else {
              // Fallback if offscreen context fails (unlikely)
              ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight); 
          }
          
          ctx.filter = 'none';
      } catch (e) {
          console.error("Failed to load logo", e);
          // Fallback to text if logo fails
           ctx.font = `bold ${titleFontSize}px "Playfair Display", serif`;
          const fallbackHeight = titleFontSize + gap + dateFontSize;
          const fallbackStart = contentBottom + (bottomBannerHeight - fallbackHeight) / 2;
          ctx.fillText('Photobooth', centerX, fallbackStart);
      }
      
      // Draw Date below Logo
      ctx.font = `italic ${dateFontSize}px "Playfair Display", serif`;
      ctx.fillStyle = isDark ? '#a8a29e' : '#57534e'; 
      ctx.fillText(dateStr, centerX, groupStartY + logoHeight + gap);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}
