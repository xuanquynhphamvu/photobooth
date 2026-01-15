# Initial Concept
Build a client-side photobooth web app inspired by "Little Vintage Photobooth".
The app must run fully in the browser with NO backend and NO server storage.

TECH STACK (STRICT):
- Next.js (App Router)
- React (client components where needed)
- shadcn/ui
- Tailwind CSS
- HTML Canvas API
- Browser getUserMedia API

DO NOT use:
- Any backend
- Any database
- Firebase / Supabase
- React Router (use Next.js routing only)

CORE FEATURES:
1. Camera Access
- Use navigator.mediaDevices.getUserMedia
- Show live camera preview
- Gracefully handle permission errors
- Mobile-friendly

2. Photo Capture Flow
- Countdown (3 → 2 → 1)
- Capture multiple photos
- Store photos in memory (state only)

3. Filters
- Apply visual filters using Canvas or CSS filters
- Filters should be non-destructive
- Allow preview before final export

4. Photostrip Generation
- Combine multiple captured images into one vertical photostrip
- Use Canvas to:
  - Stack images
  - Add padding
  - Add optional text (date or caption)
- Match a clean, vintage aesthetic

5. Export
- Download final photostrip as PNG
- No uploads, no sharing links

UI / UX REQUIREMENTS:
- Minimalist
- Soft vintage feel (not purple-heavy)
- Large capture button
- Clear step-by-step flow:
  Camera → Capture → Preview → Download

ARCHITECTURE:
- App Router layout
- One main photobooth page
- Separate components:
  - CameraView
  - CaptureControls
  - FilterSelector
  - PhotostripPreview

OUTPUT EXPECTATIONS:
- Explain folder structure
- Provide full component code
- Include Tailwind + shadcn setup steps
- Include Canvas logic clearly
- Comment important sections
- Keep code production-ready

# Product Definition

## Target Users
The app is primarily designed for casual users seeking a fun, nostalgic, and effortless way to capture memories with friends. It caters to those who appreciate the aesthetic of vintage photobooths and want a quick, web-based tool to create stylized content without the need for complex software or account creation.

## Primary Goal
The central mission of the app is to provide a seamless, browser-based experience for capturing multiple photos and instantly generating a high-quality, stylized vintage photostrip. The focus is on speed, simplicity, and the immediate gratification of downloading a beautiful, ready-to-share digital souvenir.

## Core Features & "Vintage" Experience
To deliver an authentic vintage feel, the app emphasizes:
- **Classic Visual Filters:** Non-destructive filters such as film grain, black & white, and sepia to evoke different eras of photography.
- **Atmospheric Countdown:** A 3-2-1 countdown sequence before each capture, mimicking the anticipation of a traditional physical photobooth.
- **Vertical Photostrip Layout:** Automatic generation of a vertical strip that stacks images with classic white borders and customizable padding.
- **Smart Captions:** Inclusion of the current date and an optional, user-defined caption at the bottom of the strip for personalization.
- **Privacy-First Export:** A purely client-side workflow where images are stored only in memory and downloaded directly as PNGs, ensuring no data ever leaves the user's browser.

## User Interface & Experience
The UI follows a minimalist philosophy to let the photos shine:
- **Clean Aesthetic:** A spacious layout with significant white space and a soft, muted color palette (avoiding harsh purples or overly modern neon colors).
- **Streamlined Flow:** A clear, step-by-step progression—Camera Access → Capture Sequence → Filter & Layout Preview → Download.
- **Intuitive Controls:** A large, prominent capture button and simple, obvious actions for filtering and exporting.
