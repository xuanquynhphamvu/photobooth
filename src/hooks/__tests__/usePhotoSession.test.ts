import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePhotoSession } from '../usePhotoSession';

// Mock useSound
const mockPlayShutterSound = vi.fn();
vi.mock('../useSound', () => ({
  useSound: () => ({
    playShutterSound: mockPlayShutterSound
  })
}));

describe('usePhotoSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPlayShutterSound.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => usePhotoSession());
    expect(result.current.status).toBe('idle');
    expect(result.current.photos).toEqual([]);
    expect(result.current.countdown).toBe(0);
  });

  it('should start current session and enter countdown', () => {
    const { result } = renderHook(() => usePhotoSession());
    
    act(() => {
      result.current.startSession();
    });

    expect(result.current.status).toBe('countdown');
    expect(result.current.countdown).toBe(3);
  });

  it('should count down and capture photo', async () => {
     const captureFn = vi.fn().mockResolvedValue('blob:test');
     const { result } = renderHook(() => usePhotoSession({ captureFn }));

     act(() => {
       result.current.startSession();
     });

     // 3 -> 2
     act(() => { vi.advanceTimersByTime(1000); });
     expect(result.current.countdown).toBe(2);

     // 2 -> 1
     act(() => { vi.advanceTimersByTime(1000); });
     expect(result.current.countdown).toBe(1);

     // 1 -> 0 -> Capture
     await act(async () => { vi.advanceTimersByTime(1000); });
     
     expect(captureFn).toHaveBeenCalledTimes(1);
     expect(mockPlayShutterSound).toHaveBeenCalledTimes(1);
     expect(result.current.photos).toHaveLength(1);
  });

  it('should complete session after 6 photos', async () => {
    const captureFn = vi.fn().mockResolvedValue('blob:test');
    const { result } = renderHook(() => usePhotoSession({ captureFn }));

    // Start session
    act(() => { result.current.startSession(); });

    // Loop for 6 photos
    for (let i = 1; i <= 6; i++) {
        // Run timer for countdown (3s) - needs to be step by step to trigger effect chains
        for(let j=0; j<3; j++) {
            await act(async () => { vi.advanceTimersByTime(1000); });
        }
        
        // Wait for capture to complete (async)
        await act(async () => {
             // Resolve any pending promises including captureFn
             await Promise.resolve();
             await Promise.resolve(); 
        });
        
        // Verify intermediate state if needed, but mainly waiting for loop to finish
        expect(result.current.photos).toHaveLength(i);
        
        // If not last photo, should be back in countdown or about to be
        if (i < 6) {
             // small advance to ensure state transition to next countdown if needed
             await act(async () => { vi.advanceTimersByTime(100); });
        }
    }

    expect(result.current.photos).toHaveLength(6);
    expect(result.current.status).toBe('layout-selection');
  });
});
