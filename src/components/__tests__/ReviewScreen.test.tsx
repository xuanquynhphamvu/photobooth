import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewScreen } from '../ReviewScreen';

describe('ReviewScreen', () => {
  const mockPhotos = [
    'blob:photo1',
    'blob:photo2',
    'blob:photo3',
    'blob:photo4',
  ];
  const mockOnRetake = vi.fn();
  const mockOnSave = vi.fn();

  it('renders all photos', () => {
    // Only 3 photos fit in 'strip' layout
    const stripPhotos = mockPhotos.slice(0, 4);
    render(<ReviewScreen photos={stripPhotos} onRetake={mockOnRetake} initialLayout="grid" />);
    // With grid layout, default is 4 photos
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
  });

  it('applies default filter (none)', () => {
    render(<ReviewScreen photos={mockPhotos} onRetake={mockOnRetake} initialLayout="strip" />);
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img.className).toContain('filter-none');
    });
  });

  it('changes filter when button is clicked', () => {
    render(<ReviewScreen photos={mockPhotos} onRetake={mockOnRetake} initialLayout="strip" />);
    
    const sepiaBtn = screen.getByText('Sepia');
    fireEvent.click(sepiaBtn);

    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img.className).toContain('filter-sepia');
      expect(img.className).not.toContain('filter-none');
    });
  });

  it('calls onRetake when retake button is clicked', () => {
    render(<ReviewScreen photos={mockPhotos} onRetake={mockOnRetake} initialLayout="strip" />);
    
    const retakeBtn = screen.getByText('Retake');
    fireEvent.click(retakeBtn);

    expect(mockOnRetake).toHaveBeenCalled();
  });
});
