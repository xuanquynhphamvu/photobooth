# Photobooth

A modern, responsive web-based photobooth application built with Next.js and TypeScript. This project provides a seamless and interactive experience for capturing moments, customizing photo layouts, and sharing memories.

## 🌟 Features

- **Dual Capture Modes**: Choose between capturing fresh photos with the **Live Camera** interface or **Uploading** existing photos from your device.
- **Interactive Camera**: Real-time camera feed with an integrated countdown timer and flash effects for that authentic photobooth feel.
- **Flexible Layouts**: diverse layout options including **Portrait Strips**, **Landscape Strips**, and **Grids**, suitable for any vibe.
- **Smart Photo Customization**: Drag, reposition, and adjust photos within your selected frame to get the perfect composition every time.
- **Review & Personalize**: A robust review screen where you can tweak your layout or retake photos if needed.
- **Print & Share**: Built-in printing functionality and instant QR code generation for easy digital sharing.
- **Responsive Design**: A fluid, "mobile-first" but "desktop-ready" interface that looks great on iPads, laptops, and phones.
- **Customizable Theme**: Built with a warm #FCF7EF background and minimalist button styles for a premium aesthetic.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with `clsx` and `tailwind-merge`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `react-qr-code` for sharing, `html2canvas` (implied for photo generation logic)
- **Testing**: [Vitest](https://vitest.dev/) & React Testing Library

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/mvp-photobooth.git
    cd mvp-photobooth
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `src/app`: Application routing and pages (App Router).
- `src/components`: Reusable UI components including `CameraView`, `ReviewScreen`, and `LayoutSelectionScreen`.
- `src/hooks`: Custom hooks like `useCamera` and `usePhotoSession` that manage device hardware and session state.
- `src/lib`: Core logic for photo manipulation, layout configuration (`layout-config.ts`), and helper functions.

## 🎨 Customization

You can easily customize aspects of the photobooth by editing `src/lib/layout-config.ts`.

- **Canvas Dimensions**: Adjust `photoWidth`, `photoHeight`, and padding.
- **Colors**: Modify `textOnDark` and `textOnLight` to match your event theme.
- **Date Format**: Customize how the date appears on the final photo strip.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
