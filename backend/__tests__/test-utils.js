// Test utilities and factories

/**
 * Creates a mock message for API testing
 */
function createMockMessage(role = 'user', content = 'Hello') {
  return {
    role,
    content
  };
}

/**
 * Creates a mock message history
 */
function createMockHistory(count = 3) {
  const messages = [];
  for (let i = 0; i < count; i++) {
    messages.push(createMockMessage('user', `Question ${i + 1}`));
    messages.push(createMockMessage('assistant', `Answer ${i + 1}`));
  }
  return messages;
}

/**
 * Creates a mock Claude API response
 */
function createMockApiResponse(text = 'This is a helpful response about the campus.') {
  return {
    content: [
      {
        text
      }
    ],
    usage: {
      input_tokens: 150,
      output_tokens: 50
    }
  };
}

/**
 * Creates a mock building object
 */
function createMockBuilding(overrides = {}) {
  return {
    id: 'test-building',
    name: 'Test Building',
    type: 'Academic',
    color: '#3b82f6',
    lat: 47.6205,
    lng: -122.3490,
    description: 'A test building for unit tests',
    hours: 'Mon–Fri: 8am–10pm',
    amenities: ['WiFi', 'Tables'],
    scenes: [
      { file: 'test.jpg', label: 'Test Scene', hfov: 110 }
    ],
    ...overrides
  };
}

/**
 * Creates multiple mock buildings
 */
function createMockBuildings(count = 3) {
  return Array.from({ length: count }, (_, i) => 
    createMockBuilding({
      id: `building-${i + 1}`,
      name: `Building ${i + 1}`
    })
  );
}

module.exports = {
  createMockMessage,
  createMockHistory,
  createMockApiResponse,
  createMockBuilding,
  createMockBuildings
};
