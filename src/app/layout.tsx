import type { Metadata } from "next";
import { Playfair_Display, Inter, Special_Elite } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const vintage = Special_Elite({
  variable: "--font-vintage",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mel photobooth ✧°📷༘ ⋆.˚",
  description: "Vintage photobooth experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} ${vintage.variable} font-vintage lowercase antialiased`}>
        {children}
      </body>
    </html>
  );
}
