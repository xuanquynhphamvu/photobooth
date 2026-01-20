'use client';

interface CountdownOverlayProps {
  count: number;
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  if (count <= 0) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div 
        key={count}
        className="text-9xl font-serif text-white/50 drop-shadow-2xl animate-in zoom-in-50 fade-in-0 duration-500"
      >
        {count}
      </div>
    </div>
  );
}
