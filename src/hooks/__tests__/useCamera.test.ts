import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCamera } from '../useCamera';

describe('useCamera', () => {
  const originalMediaDevices = global.navigator.mediaDevices;
  
  beforeEach(() => {
    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: originalMediaDevices,
      writable: true,
    });
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useCamera());
    expect(result.current.stream).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle successful camera access', async () => {
    const mockStream = { getTracks: () => [] } as unknown as MediaStream;
    (global.navigator.mediaDevices.getUserMedia as any).mockResolvedValueOnce(mockStream);

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.stream).toBe(mockStream);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle permission denied error', async () => {
    const mockError = new Error('Permission denied');
    mockError.name = 'NotAllowedError';
    (global.navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.stream).toBeNull();
    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle missing mediaDevices API', async () => {
    // Mock mediaDevices as undefined
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.stream).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Camera API not available');
    expect(result.current.isLoading).toBe(false);
  });

  it('should stop the camera stream', async () => {
    const mockTrack = { stop: vi.fn() };
    const mockStream = { getTracks: () => [mockTrack] } as unknown as MediaStream;
    (global.navigator.mediaDevices.getUserMedia as any).mockResolvedValueOnce(mockStream);

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await result.current.startCamera();
    });

    await act(async () => {
      result.current.stopCamera();
    });

    expect(mockTrack.stop).toHaveBeenCalled();
    expect(result.current.stream).toBeNull();
  });
});
