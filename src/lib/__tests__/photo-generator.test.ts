import { describe, it, expect, vi, beforeAll } from 'vitest';
import { generateCompositeImage } from '../photo-generator';

describe('generateCompositeImage', () => {
    // Mock Canvas API
    beforeAll(() => {
        global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
            fillRect: vi.fn(),
            drawImage: vi.fn(),
            fillText: vi.fn(),
            canvas: { width: 0, height: 0 },
        })) as any;
        global.HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,mock');
        
        // Mock Image loading
        class MockImage {
            onload: () => void = () => {};
            onerror: () => void = () => {};
            _src: string = '';
            
            set src(val: string) {
                this._src = val;
                setTimeout(() => this.onload(), 10);
            }
            get src() {
                return this._src;
            }
        }
        global.Image = MockImage as any;
    });

    it('generates a data URL', async () => {
        const photos = ['blob:1', 'blob:2', 'blob:3', 'blob:4'];
        const result = await generateCompositeImage(photos, 'none', '#ffffff', 'grid');
        expect(result).toBe('data:image/jpeg;base64,mock');
    });

    it('throws error if no photos provided', async () => {
        await expect(generateCompositeImage([], 'none')).rejects.toThrow('No photos');
    });
});
