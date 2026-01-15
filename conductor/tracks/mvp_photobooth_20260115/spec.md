# Track Specification: MVP Photobooth

## Overview
This track focuses on building the core functionality of the "Little Vintage Photobooth" web application. The application will be a pure client-side experience using Next.js, React, Tailwind CSS, shadcn/ui, and the browser's MediaDevices and Canvas APIs.

## User Stories
- **Camera Access:** As a user, I want to see a large, live front-camera preview so I can frame my shot perfectly.
- **Countdown Capture:** As a user, I want a 3-2-1 countdown before each photo is taken so I can prepare my pose.
- **Sequential Capture:** As a user, I want the app to automatically capture a sequence of 4 photos.
- **Vintage Filters:** As a user, I want to apply classic vintage filters (Sepia, B&W, Grain) to my photos with a real-time preview.
- **Photostrip Generation:** As a user, I want my photos to be automatically stacked into a vertical photostrip with classic white borders and a date caption.
- **Export:** As a user, I want to download my final photostrip as a PNG file directly to my device.

## Functional Requirements
- **Camera View:**
  - Request camera permissions on load or via a "Start" button.
  - Display a mirror-imaged live stream from the front camera.
  - Handle permission denials or lack of camera hardware gracefully.
- **Capture Flow:**
  - Trigger a sequence of 4 captures with a 3-second countdown for each.
  - Visual feedback (flash or shutter sound) during capture.
  - Store captured images in memory (React state).
- **Filter Engine:**
  - Implement filters using CSS filters for preview and Canvas API for the final export.
  - Filters: Normal, B&W, Sepia, Vintage Grain.
- **Photostrip Logic:**
  - Use HTML Canvas to stack 4 images vertically.
  - Add consistent padding and a wider bottom margin for the caption.
  - Render the current date and an optional user caption at the bottom using a serif font.
- **Download:**
  - Convert the final canvas to a Data URL (PNG).
  - Trigger a browser download with a timestamped filename.

## Non-Functional Requirements
- **Performance:** Maintain 30fps for the camera preview.
- **Privacy:** 100% client-side. No data sent to any server.
- **Responsiveness:** Mobile-first design that scales beautifully to desktop.
- **Aesthetic:** "Classic Vintage" feel with muted colors (cream/charcoal) and serif typography.

## Technical Constraints
- **Next.js App Router** (Client Components for Camera/Canvas).
- **Tailwind CSS** for all styling.
- **shadcn/ui** for accessible UI components.
- **Browser MediaDevices API** for camera access.
- **HTML5 Canvas API** for image processing and layout.
