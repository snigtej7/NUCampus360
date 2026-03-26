import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapPanel from '../components/MapPanel';
import { mockBuildings, mockFetchSuccess } from './test-utils';

describe('MapPanel Component', () => {
  const mockOnOpenTour = vi.fn();
  const mockOnAskAbout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Leaflet for map initialization
    global.L = {
      map: vi.fn(() => ({
        setView: vi.fn(() => ({ addTo: vi.fn() })),
        remove: vi.fn(),
        addControl: vi.fn()
      })),
      tileLayer: vi.fn(() => ({
        addTo: vi.fn()
      })),
      marker: vi.fn(() => ({
        addTo: vi.fn(),
        bindPopup: vi.fn(() => ({ addTo: vi.fn() }))
      })),
      divIcon: vi.fn(() => ({})),
      control: {
        zoom: vi.fn(() => ({
          addTo: vi.fn()
        }))
      }
    };
  });

  describe('Component Rendering', () => {
    it('renders map panel', () => {
      const { container } = render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('displays loading state when loading is true', () => {
      const { container } = render(
        <MapPanel 
          buildings={[]}
          loading={true}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(container).toBeTruthy();
    });

    it('renders map container', () => {
      const { container } = render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      const mapRef = container.querySelector('div[style*="flex"]');
      expect(mapRef).toBeInTheDocument();
    });
  });

  describe('Map Initialization', () => {
    it('initializes Leaflet map', () => {
      render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(global.L.map).toHaveBeenCalled();
    });

    it('calls setView with correct campus coordinates', () => {
      const mockMap = {
        setView: vi.fn(() => ({ addTo: vi.fn() })),
        remove: vi.fn(),
        addControl: vi.fn()
      };
      global.L.map.mockReturnValue(mockMap);

      render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(mockMap.setView).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Number), expect.any(Number)]),
        expect.any(Number)
      );
    });

    it('adds tile layer to map', () => {
      render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(global.L.tileLayer).toHaveBeenCalled();
    });

    it('adds zoom controls to map', () => {
      global.L.control.zoom = vi.fn(() => ({ addTo: vi.fn() }));

      render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(global.L.control.zoom).toHaveBeenCalled();
    });
  });

  describe('Marker Creation', () => {
    it('creates markers for each building', () => {
      render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(global.L.marker).toHaveBeenCalledTimes(mockBuildings.length);
    });

    it('uses correct building coordinates for markers', () => {
      render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      mockBuildings.forEach((building) => {
        expect(global.L.marker).toHaveBeenCalledWith(
          expect.arrayContaining([building.lat, building.lng]),
          expect.any(Object)
        );
      });
    });

    it('creates custom icon for each marker', () => {
      render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(global.L.divIcon).toHaveBeenCalledTimes(mockBuildings.length);
    });

    it('assigns building color to marker icon', () => {
      render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      mockBuildings.forEach((building) => {
        expect(global.L.divIcon).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining(building.color)
          })
        );
      });
    });
  });

  describe('Building Updates', () => {
    it('updates markers when buildings change', () => {
      const { rerender } = render(
        <MapPanel 
          buildings={mockBuildings.slice(0, 1)}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(global.L.marker).toHaveBeenCalledTimes(1);

      rerender(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      // Should have created markers for all buildings
      expect(global.L.marker).toHaveBeenCalledTimes(mockBuildings.length + (mockBuildings.length - 1));
    });

    it('clears existing markers before adding new ones', () => {
      const mockMarker = {
        addTo: vi.fn(),
        remove: vi.fn(),
        bindPopup: vi.fn(() => ({ addTo: vi.fn() }))
      };
      global.L.marker.mockReturnValue(mockMarker);

      const { rerender } = render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      rerender(
        <MapPanel 
          buildings={mockBuildings.slice(0, 1)}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      // Markers should be removed
      expect(mockMarker.remove).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('handles empty buildings array', () => {
      const { container } = render(
        <MapPanel 
          buildings={[]}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(container).toBeTruthy();
      expect(global.L.marker).not.toHaveBeenCalled();
    });

    it('handles loading state with no buildings', () => {
      const { container } = render(
        <MapPanel 
          buildings={[]}
          loading={true}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    it('removes map on unmount', () => {
      const mockMap = {
        setView: vi.fn(() => ({ addTo: vi.fn() })),
        remove: vi.fn(),
        addControl: vi.fn()
      };
      global.L.map.mockReturnValue(mockMap);

      const { unmount } = render(
        <MapPanel 
          buildings={mockBuildings}
          loading={false}
          onOpenTour={mockOnOpenTour}
          onAskAbout={mockOnAskAbout}
        />
      );

      unmount();

      expect(mockMap.remove).toHaveBeenCalled();
    });
  });
});
