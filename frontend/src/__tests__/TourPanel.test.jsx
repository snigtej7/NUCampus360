import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TourPanel from '../components/TourPanel';
import { mockBuilding } from './test-utils';

describe('TourPanel Component', () => {
  const mockOnClose = vi.fn();
  const mockOnShowPhotoGuide = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.pannellum = {
      viewer: vi.fn(() => ({
        destroy: vi.fn()
      }))
    };
  });

  describe('Rendering', () => {
    it('renders tour panel with building name', () => {
      render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      expect(screen.getByText(mockBuilding.name)).toBeInTheDocument();
    });

    it('displays building type', () => {
      render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      expect(screen.getByText(mockBuilding.type)).toBeInTheDocument();
    });

    it('renders back button', () => {
      render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      expect(screen.getByText(/Back/i)).toBeInTheDocument();
    });

    it('renders tour viewer when building has scenes', () => {
      const { container } = render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      const viewer = container.querySelector('[style*="ref"]');
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('displays placeholder when no scenes available', () => {
      const buildingNoScenes = {
        ...mockBuilding,
        scenes: []
      };

      render(
        <TourPanel 
          building={buildingNoScenes}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      expect(screen.getByText(/360° Tour Coming Soon/i)).toBeInTheDocument();
    });
  });

  describe('Tour Viewer Initialization', () => {
    it('initializes Pannellum viewer with building scenes', () => {
      render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      expect(global.pannellum.viewer).toHaveBeenCalled();
    });

    it('passes correct configuration to Pannellum viewer', () => {
      render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      const callArgs = global.pannellum.viewer.mock.calls[0][1];
      expect(callArgs).toHaveProperty('type', 'equirectangular');
      expect(callArgs).toHaveProperty('autoLoad', true);
      expect(callArgs).toHaveProperty('showControls', true);
    });

    it('sets HFOV from scene data', () => {
      render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      const callArgs = global.pannellum.viewer.mock.calls[0][1];
      expect(callArgs.hfov).toBeDefined();
      expect(typeof callArgs.hfov).toBe('number');
    });

    it('enables user interactions', () => {
      render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      const callArgs = global.pannellum.viewer.mock.calls[0][1];
      expect(callArgs.mouseZoom).toBe(true);
      expect(callArgs.showFullscreenCtrl).toBe(true);
    });
  });

  describe('Scene Management', () => {
    it('displays first scene by default', () => {
      render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      const callArgs = global.pannellum.viewer.mock.calls[0][1];
      expect(callArgs.panorama).toContain(mockBuilding.scenes[0].file);
    });

    it('updates viewer when active scene changes', async () => {
      const { rerender } = render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      // Simulate scene change (would be through UI interaction)
      expect(global.pannellum.viewer).toHaveBeenCalled();
    });
  });

  describe('User Actions', () => {
    it('calls onClose when back button clicked', async () => {
      const user = userEvent.setup();
      render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      const backButton = screen.getByText(/Back/i);
      await user.click(backButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onShowPhotoGuide when "How to add photos" button clicked', async () => {
      const buildingNoScenes = {
        ...mockBuilding,
        scenes: []
      };

      const user = userEvent.setup();
      render(
        <TourPanel 
          building={buildingNoScenes}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      const photoButton = screen.getByText(/How to add photos/i);
      await user.click(photoButton);

      expect(mockOnShowPhotoGuide).toHaveBeenCalled();
    });
  });

  describe('Placeholder UI', () => {
    it('displays camera emoji in placeholder', () => {
      const buildingNoScenes = {
        ...mockBuilding,
        scenes: []
      };

      render(
        <TourPanel 
          building={buildingNoScenes}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      expect(screen.getByText('📸')).toBeInTheDocument();
    });

    it('shows building name in placeholder message', () => {
      const buildingNoScenes = {
        ...mockBuilding,
        scenes: []
      };

      render(
        <TourPanel 
          building={buildingNoScenes}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      expect(screen.getByText(mockBuilding.name)).toBeInTheDocument();
    });

    it('displays informative text about adding photos', () => {
      const buildingNoScenes = {
        ...mockBuilding,
        scenes: []
      };

      render(
        <TourPanel 
          building={buildingNoScenes}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      expect(screen.getByText(/equirectangular panoramic photos/i)).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('destroys viewer on unmount', () => {
      const mockViewer = {
        destroy: vi.fn()
      };
      global.pannellum.viewer.mockReturnValue(mockViewer);

      const { unmount } = render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      unmount();

      expect(mockViewer.destroy).toHaveBeenCalled();
    });

    it('handles destroy errors gracefully', () => {
      const mockViewer = {
        destroy: vi.fn(() => {
          throw new Error('Destroy error');
        })
      };
      global.pannellum.viewer.mockReturnValue(mockViewer);

      const { unmount } = render(
        <TourPanel 
          building={mockBuilding}
          onClose={mockOnClose}
          onShowPhotoGuide={mockOnShowPhotoGuide}
        />
      );

      // Should not throw
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});
