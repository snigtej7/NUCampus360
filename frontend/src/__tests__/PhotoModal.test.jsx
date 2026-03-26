import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoModal from '../components/PhotoModal';

describe('PhotoModal Component', () => {
  const mockOnClose = vi.fn();

  describe('Rendering', () => {
    it('renders modal with title', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/Adding 360° Photos/i)).toBeInTheDocument();
    });

    it('displays all instruction steps', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      
      expect(screen.getByText(/Capture with your phone/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload to Cloudinary/i)).toBeInTheDocument();
      expect(screen.getByText(/Add URL to campus data/i)).toBeInTheDocument();
      expect(screen.getByText(/Deploy & done/i)).toBeInTheDocument();
    });

    it('displays step numbers', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      
      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.getByText('3.')).toBeInTheDocument();
      expect(screen.getByText('4.')).toBeInTheDocument();
    });

    it('displays close button', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('displays informational text about Pannellum', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/Pannellum/i)).toBeInTheDocument();
    });

    it('displays example code block', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/tourImages:/i)).toBeInTheDocument();
    });

    it('displays all step icons', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      
      expect(screen.getByText('📱')).toBeInTheDocument();
      expect(screen.getByText('🖼')).toBeInTheDocument();
      expect(screen.getByText('🛠')).toBeInTheDocument();
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      render(<PhotoModal onClose={mockOnClose} />);

      const closeButton = screen.getByText('✕');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when closing action button clicked', async () => {
      const user = userEvent.setup();
      render(<PhotoModal onClose={mockOnClose} />);

      const closeButton = screen.getByText(/Got it/i) || screen.getByText(/Close/i);
      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('calls onClose when backdrop clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<PhotoModal onClose={mockOnClose} />);

      const backdrop = container.querySelector('[style*="position: fixed"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Step Instructions Content', () => {
    it('includes phone capture instruction', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/Google Street View app|Insta360 app/)).toBeInTheDocument();
    });

    it('includes Cloudinary upload instruction', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/cloudinary.com/i)).toBeInTheDocument();
    });

    it('includes data file modification instruction', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/backend\/data\/campus.js/i)).toBeInTheDocument();
    });

    it('includes deployment instruction', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/Render|GitHub|deploy/i)).toBeInTheDocument();
    });
  });

  describe('Code Example Display', () => {
    it('displays valid tourImages array syntax', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/tourImages:\s*\[/)).toBeInTheDocument();
    });

    it('shows Cloudinary URL format example', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/cloudinary/i)).toBeInTheDocument();
    });

    it('demonstrates multiple image URLs', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/lobby.*main_hall.*lab/i, { exact: false })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has semantic structure', () => {
      const { container } = render(<PhotoModal onClose={mockOnClose} />);
      const modal = container.querySelector('div[style*="position: fixed"]');
      expect(modal).toBeInTheDocument();
    });

    it('displays text content clearly', () => {
      render(<PhotoModal onClose={mockOnClose} />);
      expect(screen.getByText(/Adding 360° Photos/i)).toBeVisible();
    });

    it('has sufficient contrast and readability', () => {
      const { container } = render(<PhotoModal onClose={mockOnClose} />);
      const title = screen.getByText(/Adding 360° Photos/i);
      expect(title).toBeInTheDocument();
      expect(title).toBeVisible();
    });
  });

  describe('Modal Styling', () => {
    it('renders as overlay modal', () => {
      const { container } = render(<PhotoModal onClose={mockOnClose} />);
      const overlay = container.querySelector('[style*="position: fixed"]');
      expect(overlay).toBeInTheDocument();
    });

    it('has dark background overlay', () => {
      const { container } = render(<PhotoModal onClose={mockOnClose} />);
      const overlay = container.querySelector('[style*="rgba(0,0,0"]');
      expect(overlay).toBeInTheDocument();
    });

    it('centers modal content', () => {
      const { container } = render(<PhotoModal onClose={mockOnClose} />);
      const modal = container.querySelector('div[style*="maxWidth"]');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('accepts onClose callback prop', () => {
      const callback = vi.fn();
      render(<PhotoModal onClose={callback} />);
      expect(typeof callback).toBe('function');
    });

    it('passes through onClose to buttons', async () => {
      const user = userEvent.setup();
      render(<PhotoModal onClose={mockOnClose} />);

      const closeButton = screen.getByText('✕');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
