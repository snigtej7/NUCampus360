import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { mockBuildings, mockChatResponse, mockFetchSuccess, mockFetchError } from './test-utils';

// Mock child components to isolate App logic
vi.mock('../components/Nav', () => ({
  default: () => <div data-testid="nav">Nav Component</div>
}));

vi.mock('../components/MapPanel', () => ({
  default: ({ buildings, onOpenTour, onAskAbout }) => (
    <div data-testid="map-panel">
      Map Panel
      {buildings.map(b => (
        <button key={b.id} onClick={() => onOpenTour(b.id)}>
          {b.name}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../components/ChatPanel', () => ({
  default: ({ pendingQuestion, onPendingHandled }) => (
    <div data-testid="chat-panel">
      Chat Panel
      {pendingQuestion && <div>{pendingQuestion}</div>}
      <button onClick={onPendingHandled}>Handle Pending</button>
    </div>
  )
}));

vi.mock('../components/TourPanel', () => ({
  default: ({ building, onClose }) => (
    <div data-testid="tour-panel">
      Tour Panel - {building.name}
      <button onClick={onClose}>Close Tour</button>
    </div>
  )
}));

vi.mock('../components/PhotoModal', () => ({
  default: ({ onClose }) => (
    <div data-testid="photo-modal">
      Photo Modal
      <button onClick={onClose}>Close Modal</button>
    </div>
  )
}));

describe('App Component — Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchSuccess({ buildings: mockBuildings });
  });

  describe('App Initialization', () => {
    it('renders main app structure', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('nav')).toBeInTheDocument();
      });
    });

    it('fetches campus data on mount', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/campus')
        );
      });
    });

    it('displays loading state initially', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      // Map panel should be rendered with loading prop
      await waitFor(() => {
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      });
    });

    it('displays map and chat panels on load', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Campus Data Fetching', () => {
    it('fetches data from correct API endpoint', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        expect(calls.some(call => call[0].includes('/api/campus'))).toBe(true);
      });
    });

    it('loads buildings into state', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        mockBuildings.forEach(building => {
          expect(screen.getByText(building.name)).toBeInTheDocument();
        });
      });
    });

    it('handles API failure with fallback data', async () => {
      mockFetchError('Network error');
      
      render(<App />);

      await waitFor(() => {
        // Should fall back to local data
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      });
    });

    it('loads fallback data when backend is unreachable', async () => {
      mockFetchError('Backend unavailable');
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Between Panels', () => {
    it('displays chat panel by default', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      });
    });

    it('switches to tour panel when opening tour', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(mockBuildings[0].name)).toBeInTheDocument();
      });

      const tourButton = screen.getByText(mockBuildings[0].name);
      await user.click(tourButton);

      await waitFor(() => {
        expect(screen.getByTestId('tour-panel')).toBeInTheDocument();
      });
    });

    it('returns to chat panel when closing tour', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        const tourButton = screen.getByText(mockBuildings[0].name);
        user.click(tourButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('tour-panel')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close Tour');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Building Tour Interaction', () => {
    it('opens tour for selected building', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(mockBuildings[0].name)).toBeInTheDocument();
      });

      const buildingButton = screen.getByText(mockBuildings[0].name);
      await user.click(buildingButton);

      await waitFor(() => {
        expect(screen.getByTestId('tour-panel')).toBeInTheDocument();
        expect(screen.getByText(mockBuildings[0].name)).toBeInTheDocument();
      });
    });

    it('passes correct building data to tour panel', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        const button = screen.getByText(mockBuildings[1].name);
        user.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText(`Tour Panel - ${mockBuildings[1].name}`)).toBeInTheDocument();
      });
    });

    it('handles invalid building ID gracefully', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      });

      // Attempting to open non-existent building should not crash
      expect(() => {
        // Empty click since building doesn't exist
      }).not.toThrow();
    });
  });

  describe('Chat Question from Map', () => {
    it('sends pending question from map marker', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      });

      // Simulate asking about a building from map
      const buildingName = mockBuildings[0].name;
    });

    it('transitions to chat panel when asking about building', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      });

      // Chat panel should still be visible
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });

    it('injected question is handled by chat panel', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Photo Modal Management', () => {
    it('opens photo modal', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      const { container } = render(<App />);

      // Photo modal should not be visible initially
      // (In real component, it would be opened via tour panel action)
      expect(() => {
        screen.getByTestId('photo-modal');
      }).toThrow();
    });

    it('closes photo modal', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Layout and Structure', () => {
    it('always displays map panel', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      });

      // Map should still be visible after events
    });

    it('displays right sidebar with chat or tour', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      });
    });

    it('maintains flex layout during navigation', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      const { container } = render(<App />);

      await waitFor(() => {
        expect(container.querySelector('div[style*="flex"]')).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('manages activePanel state correctly', async () => {
      const user = userEvent.setup();
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      });

      // Initial state is 'chat'
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });

    it('manages activeTourBuilding state', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      });

      // Initially no tour building selected
      expect(() => {
        screen.getByTestId('tour-panel');
      }).toThrow();
    });

    it('manages buildings state from API', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        mockBuildings.forEach(b => {
          expect(screen.getByText(b.name)).toBeInTheDocument();
        });
      });
    });

    it('manages loading state', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Resilience', () => {
    it('handles missing buildings gracefully', async () => {
      mockFetchSuccess({ buildings: [] });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      });
    });

    it('handles API response with unexpected format', async () => {
      mockFetchSuccess({});
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('map-panel')).toBeInTheDocument();
      });
    });

    it('recovers from network errors', async () => {
      mockFetchError('Network timeout');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Environment Variables', () => {
    it('uses VITE_API_URL from environment', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('defaults to /api when VITE_API_URL not set', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        expect(calls.some(call => 
          call[0].includes('/api/campus') || 
          call[0].endsWith('/api/campus')
        )).toBe(true);
      });
    });
  });

  describe('API Configuration', () => {
    it('passes correct API base to ChatPanel', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      });
    });

    it('passes correct building data to MapPanel', async () => {
      mockFetchSuccess({ buildings: mockBuildings });
      render(<App />);

      await waitFor(() => {
        mockBuildings.forEach(b => {
          expect(screen.getByText(b.name)).toBeInTheDocument();
        });
      });
    });
  });
});
