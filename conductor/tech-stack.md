# Technology Stack

## Core Framework & Language
- **Framework:** [Next.js (App Router)](https://nextjs.org/) - For a modern, file-system based routing and optimized React application structure.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - To ensure type safety and improved developer experience across the codebase.
- **Library:** [React](https://react.dev/) - Utilizing Client Components for interactive camera and canvas-based features.

## UI & Styling
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - For rapid, utility-first CSS styling and easy implementation of the vintage aesthetic.
- **Components:** [shadcn/ui](https://ui.shadcn.com/) - A collection of re-usable components built with Radix UI and Tailwind CSS for a polished, minimalist interface.
- **Icons:** [Lucide React](https://lucide.dev/) - For clean, consistent iconography.

## Browser APIs (Pure Client-Side)
- **Camera:** `navigator.mediaDevices.getUserMedia` - To access and stream the user's camera directly in the browser.
- **Graphics & Export:** [HTML Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - Used for applying non-destructive filters, stacking captured images into a photostrip, and generating the final PNG export.

## Data & Storage (Strict Constraints)
- **Backend:** None. The application is fully serverless and runs entirely in the client's browser.
- **Database:** None. No user data, images, or settings are stored on any server.
- **State Management:** React `useState` and `useRef` - All captured images and session data are stored in-memory and are lost upon page refresh.
- **Export Mechanism:** Client-side PNG download via the Canvas API.
