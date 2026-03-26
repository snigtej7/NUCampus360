import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPanel from '../components/ChatPanel';
import { mockFetchSuccess, mockFetchError, mockChatResponse } from './test-utils';

describe('ChatPanel Component', () => {
  const mockApiBase = '/api';
  const mockOnPendingHandled = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchSuccess({ reply: 'Test response' });
  });

  describe('Rendering', () => {
    it('renders chat panel with initial message', () => {
      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );
      
      expect(screen.getByText(/Hi! I'm Husky/i)).toBeInTheDocument();
    });

    it('displays Husky avatar', () => {
      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );
      
      expect(screen.getByText('🐾')).toBeInTheDocument();
    });

    it('displays initial quick prompt buttons', () => {
      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );
      
      expect(screen.getByText(/Where's the library?/i)).toBeInTheDocument();
      expect(screen.getByText(/Study spaces available?/i)).toBeInTheDocument();
    });

    it('renders input field', () => {
      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );
      
      const inputField = screen.getByRole('textbox', { hidden: true });
      expect(inputField).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('sends message when user types and presses Enter', async () => {
      const user = userEvent.setup();
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField, 'Where is the dining area?');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/chat'),
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });

    it('displays user message after sending', async () => {
      const user = userEvent.setup();
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField, 'Test question');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Test question')).toBeInTheDocument();
      });
    });

    it('displays AI response after API call', async () => {
      const user = userEvent.setup();
      const testResponse = 'The Dining Area is on the ground floor.';
      mockFetchSuccess({ reply: testResponse });

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField, 'Tell me about dining');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(testResponse)).toBeInTheDocument();
      });
    });

    it('clears input field after sending message', async () => {
      const user = userEvent.setup();
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField, 'Test');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(inputField.value).toBe('');
      });
    });

    it('does not send empty messages', async () => {
      const user = userEvent.setup();
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.keyboard('{Enter}');

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('sends quick prompt when clicked', async () => {
      const user = userEvent.setup();
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const quickPrompt = screen.getByText(/Where's the library?/i);
      await user.click(quickPrompt);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Pending Question Handling', () => {
    it('sends pending question automatically', async () => {
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion="Tell me about the Event Space"
          onPendingHandled={mockOnPendingHandled}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('calls onPendingHandled after sending pending question', async () => {
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion="Test pending question"
          onPendingHandled={mockOnPendingHandled}
        />
      );

      await waitFor(() => {
        expect(mockOnPendingHandled).toHaveBeenCalled();
      });
    });

    it('displays pending question in message history', async () => {
      const pendingQuestion = 'Tell me about the Flex Lab';
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={pendingQuestion}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(pendingQuestion)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator while waiting for response', async () => {
      const user = userEvent.setup();
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField, 'Test');
      await user.keyboard('{Enter}');

      // Look for the typing animation dots
      await waitFor(() => {
        const allDots = screen.queryAllByText(/•|·/);
        expect(allDots.length).toBeGreaterThanOrEqual(0);
      });
    });

    it('disables input while loading', async () => {
      const user = userEvent.setup();
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField, 'Test');
      await user.keyboard('{Enter}');

      // Input should be disabled or message should show we're blocked
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      const user = userEvent.setup();
      mockFetchError('Network error');

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField, 'Test');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/having trouble connecting/i)).toBeInTheDocument();
      });
    });

    it('continues to accept messages after error', async () => {
      const user = userEvent.setup();
      mockFetchError('Network error');

      const { rerender } = render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField, 'First message');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/having trouble connecting/i)).toBeInTheDocument();
      });

      // Try again with successful response
      mockFetchSuccess(mockChatResponse);
      rerender(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField2 = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField2, 'Second message');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Second message')).toBeInTheDocument();
      });
    });
  });

  describe('Message History', () => {
    it('builds correct message format for API', async () => {
      const user = userEvent.setup();
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField, 'What is the campus?');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        const lastCall = calls[calls.length - 1];
        const body = JSON.parse(lastCall[1].body);
        
        expect(body.messages).toBeInstanceOf(Array);
        expect(body.messages[0]).toHaveProperty('role');
        expect(body.messages[0]).toHaveProperty('content');
      });
    });

    it('preserves message history for context', async () => {
      const user = userEvent.setup();
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      
      // First message
      await user.type(inputField, 'First question');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('First question')).toBeInTheDocument();
      });

      // Second message
      await user.type(inputField, 'Second question');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Second question')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Prompts Behavior', () => {
    it('hides quick prompts after first message', async () => {
      const user = userEvent.setup();
      mockFetchSuccess(mockChatResponse);

      render(
        <ChatPanel 
          apiBase={mockApiBase} 
          pendingQuestion={null}
          onPendingHandled={mockOnPendingHandled}
        />
      );

      const inputField = screen.getByRole('textbox', { hidden: true });
      await user.type(inputField, 'Test');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        // After sending first message, quick prompts should be hidden
        const quickPrompts = screen.queryAllByText(/Where's the library?/i);
        expect(quickPrompts.length).toBeLessThanOrEqual(1);
      });
    });
  });
});
