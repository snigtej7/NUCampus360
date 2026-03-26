import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.L (Leaflet) since it's loaded via CDN
global.L = {
  map: vi.fn(() => ({
    setView: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis()
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn().mockReturnThis()
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis()
  })),
  divIcon: vi.fn(() => ({})),
  control: {
    zoom: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis()
    }))
  }
};

// Mock window.pannellum
global.pannellum = {
  viewer: vi.fn(() => ({
    destroy: vi.fn(),
    loadScene: vi.fn().mockReturnThis()
  }))
};

// Mock fetch globally
global.fetch = vi.fn();
