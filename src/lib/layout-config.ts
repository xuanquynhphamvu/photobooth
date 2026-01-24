export const LAYOUT_CONFIG = {
  // Canvas Dimensions (High Resolution)
  photoWidth: 640,
  photoHeight: 480,
  padding: 15,
  bottomBannerHeight: 220,
  
  // Content Dimensions (on Canvas)
  logoHeight: 100,
  gap: 15,
  titleFontSize: 60,
  dateFontSize: 40,
  
  // Preview Container Widths (CSS pixels)
  previewWidthStrip: 320,
  previewWidthGrid: 480,
  
  // Colors
  colors: {
    // The color of the Note/Date when the background is "Dark" (Black, Dark Gray, Vintage Brown)
    textOnDark: '#e6dbc6', 
    // The color of the Note/Date when the background is "Light" (Stone, White, Pink, etc)
    textOnLight: '#745e59',
  },

  // Dynamic Dimensions Helper
  getDimensions: (isPortrait: boolean) => {
    return {
      width: isPortrait ? 480 : 640,
      height: isPortrait ? 640 : 480,
    };
  }
};

// Helper function for Date Format
// Change this function to customize how the date appears (e.g. "12.05.2024" or "May 12, 2024")
export const getFormattedDate = () => {
    const d = new Date();
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};
