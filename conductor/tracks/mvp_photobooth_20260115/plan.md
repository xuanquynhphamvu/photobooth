# Implementation Plan: MVP Photobooth

This plan outlines the steps to build the core photobooth functionality, following a TDD approach and the project's vintage aesthetic guidelines.

## Phase 1: Project Scaffolding & Basic UI
Goal: Initialize the Next.js project, set up shadcn/ui, and create the layout with vintage styling.

- [ ] **Task: Initialize Next.js and Install Dependencies**
    - [ ] Initialize Next.js app with TypeScript, Tailwind, and ESLint.
    - [ ] Install shadcn/ui and configure the theme with warm neutrals (cream/charcoal).
    - [ ] Set up basic folder structure (`components`, `hooks`, `lib`).
- [ ] **Task: Create Main Layout and Typography**
    - [ ] Implement the main layout with a soft vintage background.
    - [ ] Configure serif fonts (Playfair Display or Lora) for headings.
    - [ ] Create a basic "Start" screen component.
- [ ] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)**

## Phase 2: Camera Access & Preview
Goal: Implement the live camera stream with mirror effect and error handling.

- [ ] **Task: Implement Camera Hook**
    - [ ] Write tests for a `useCamera` hook (mocking `getUserMedia`).
    - [ ] Implement `useCamera` hook to manage stream and permissions.
- [ ] **Task: Create CameraView Component**
    - [ ] Write tests for the `CameraView` component.
    - [ ] Implement `CameraView` with a mirrored video stream and large display.
- [ ] **Task: Handle Permission Errors**
    - [ ] Write tests for error states.
    - [ ] Implement graceful error UI for denied permissions.
- [ ] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**

## Phase 3: Capture Logic & Countdown
Goal: Implement the 4-photo sequence capture with a visual countdown.

- [ ] **Task: Implement Countdown Timer**
    - [ ] Write tests for a countdown timer utility/hook.
    - [ ] Implement the 3-2-1 visual countdown.
- [ ] **Task: Sequential Capture Logic**
    - [ ] Write tests for the capture sequence (4 photos).
    - [ ] Implement logic to capture frames from the video stream to a canvas/blob.
    - [ ] Store captures in React state.
- [ ] **Task: Capture Controls UI**
    - [ ] Implement the "Capture" button and progress indicators.
- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**

## Phase 4: Filters & Real-time Preview
Goal: Add non-destructive vintage filters and a filter selector UI.

- [ ] **Task: Define Filter Presets**
    - [ ] Create a library of CSS filter strings (B&W, Sepia, Grain).
- [ ] **Task: Implement Filter Selector Component**
    - [ ] Write tests for `FilterSelector`.
    - [ ] Implement a horizontal scrolling list of filter options.
- [ ] **Task: Apply Filters to Preview**
    - [ ] Implement real-time CSS filter application to the video stream.
- [ ] **Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)**

## Phase 5: Photostrip Generation & Export
Goal: Use Canvas API to stack images into a photostrip and provide PNG download.

- [ ] **Task: Implement Photostrip Canvas Logic**
    - [ ] Write tests for the photostrip generator utility.
    - [ ] Implement Canvas logic to stack 4 images with borders and padding.
    - [ ] Add date and optional caption to the footer.
- [ ] **Task: Preview & Download UI**
    - [ ] Implement the `PhotostripPreview` component.
    - [ ] Implement the "Download PNG" button with timestamped filename.
- [ ] **Task: Final Polish & Responsive Refinements**
    - [ ] Ensure smooth transitions (faded) between phases.
    - [ ] Final mobile responsiveness check.
- [ ] **Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)**
