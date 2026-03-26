import { vi } from 'vitest';

/**
 * Mock factories for frontend components
 */

export const mockBuilding = {
  id: 'event',
  name: 'Event Space',
  type: 'Event Space',
  color: '#CC0000',
  lat: 47.62413,
  lng: -122.33958,
  description: 'Large open-plan gathering space on the ground floor west wing.',
  hours: 'Mon–Fri: 7am–10pm | Sat–Sun: 9am–6pm',
  amenities: ['Flexible Round Tables', 'Rainbow Mural', 'Floor-to-Ceiling Glass'],
  scenes: [
    { file: 'tours/Event/event (1).jpg', label: 'Main Floor', hfov: 110 },
    { file: 'tours/Event/event (2).jpg', label: 'Lounge Side', hfov: 110 }
  ]
};

export const mockBuildings = [
  mockBuilding,
  {
    id: 'dining',
    name: 'Dining Area',
    type: 'Dining',
    color: '#e07b39',
    lat: 47.62427,
    lng: -122.33927,
    description: 'Campus dining area featuring a central kitchen island.',
    hours: 'Mon–Fri: 8am–8pm | Sat: 10am–4pm | Sun: Closed',
    amenities: ['Kitchen Island', 'Red Bar Stools', 'Coffee Station'],
    scenes: [
      { file: 'tours/Dining/dining (1).jpg', label: 'Global Wall', hfov: 110 }
    ]
  },
  {
    id: 'classrooms',
    name: 'Classrooms',
    type: 'Academic',
    color: '#3b82f6',
    lat: 47.62398,
    lng: -122.33918,
    description: 'Modern classrooms with long rows of white desks.',
    hours: 'Mon–Fri: 8am–10pm | Sat: 9am–6pm | Sun: Closed',
    amenities: ['Long Desk Rows', 'Rolling Chairs', 'Multiple HD Screens'],
    scenes: []
  }
];

export const createMockFetchResponse = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  });
};

export const mockChatResponse = {
  reply: 'The Dining Area is located on the ground floor east with a kitchen island and red bar stools.',
  usage: {
    input_tokens: 150,
    output_tokens: 50
  }
};

export const mockChatMessage = {
  role: 'ai',
  text: 'Hi! I\'m Husky, your AI campus guide.'
};

export const mockUserMessage = {
  role: 'user',
  text: 'Where is the dining area?'
};

/**
 * Create a mock message with optional overrides
 */
export function createMockMessage(overrides = {}) {
  return {
    role: 'user',
    text: 'Test message',
    ...overrides
  };
}

/**
 * Create mock chat history
 */
export function createMockChatHistory(count = 2) {
  const messages = [];
  for (let i = 0; i < count; i++) {
    messages.push({ role: 'user', text: `Question ${i + 1}` });
    messages.push({ role: 'ai', text: `Answer ${i + 1}` });
  }
  return messages;
}

/**
 * Setup fetch mock for successful API call
 */
export function mockFetchSuccess(data) {
  global.fetch = vi.fn(() => createMockFetchResponse(data));
  return global.fetch;
}

/**
 * Setup fetch mock for failed API call
 */
export function mockFetchError(error = 'Network error') {
  global.fetch = vi.fn(() => Promise.reject(new Error(error)));
  return global.fetch;
}

/**
 * Setup fetch mock for API error response
 */
export function mockFetchApiError(statusCode = 500, errorMessage = 'Server error') {
  global.fetch = vi.fn(() => 
    createMockFetchResponse({ error: errorMessage }, statusCode)
  );
  return global.fetch;
}
