'use client';

interface FlashEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function FlashEffect({ trigger }: FlashEffectProps) {
  if (!trigger) return null;

  return (
    <div className="absolute inset-0 bg-white/70 z-50 pointer-events-none animate-out fade-out duration-500" />
  );
}
