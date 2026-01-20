import { useEffect, RefObject } from 'react';

export function useOverflowControl(contentRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const checkOverflow = () => {
      if (!contentRef.current) return;

      const windowHeight = window.innerHeight;
      const contentHeight = contentRef.current.scrollHeight;

      if (contentHeight <= windowHeight) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    };

    // Initial check
    checkOverflow();

    // Listen to resize
    window.addEventListener('resize', checkOverflow);

    // Observe content changes
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      window.removeEventListener('resize', checkOverflow);
      resizeObserver.disconnect();
      document.body.style.overflow = ''; // cleanup
    };
  }, [contentRef]);
}
