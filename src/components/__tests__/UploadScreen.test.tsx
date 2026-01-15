import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadScreen } from '../UploadScreen';

describe('UploadScreen', () => {
    const mockOnUpload = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        mockOnUpload.mockClear();
        mockOnCancel.mockClear();
    });

    it('renders correctly', () => {
        render(<UploadScreen onUploadComplete={mockOnUpload} onCancel={mockOnCancel} />);
        expect(screen.getByText('Upload Photos')).toBeDefined();
        expect(screen.getByLabelText('Click to Select Photos')).toBeDefined();
    });

    it('shows error if wrong number of files selected', async () => {
        render(<UploadScreen onUploadComplete={mockOnUpload} onCancel={mockOnCancel} />);
        
        const input = screen.getByLabelText('Click to Select Photos');
        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        
        fireEvent.change(input, { target: { files: [file, file] } }); // Only 2 files

        await waitFor(() => {
            expect(screen.getByText('Please select exactly 4 photos.')).toBeDefined();
        });
        expect(mockOnUpload).not.toHaveBeenCalled();
    });

    it('calls onCancel when Cancel button is clicked', () => {
        render(<UploadScreen onUploadComplete={mockOnUpload} onCancel={mockOnCancel} />);
        
        fireEvent.click(screen.getByText('Cancel'));
        expect(mockOnCancel).toHaveBeenCalled();
    });
});
