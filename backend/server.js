const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// ── Serve static files from data folder ──────────────────────────────────────
app.use('/data', express.static(path.join(__dirname, 'data'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS policy violation'));
  },
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

// ── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,                    // 60 requests per window
  message: { error: 'Too many requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Stricter limit on chat endpoint
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,
  message: { error: 'Chat rate limit reached. Please wait a moment.' }
});

// ── Token optimization: Cache for repeated questions ──────────────────────────
const questionCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(message) {
  // Normalize question to catch variations like "hours?" vs "hours"
  return message.toLowerCase().replace(/[?!.,]/g, '').trim();
}

function getFromCache(message) {
  const key = getCacheKey(message);
  const cached = questionCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.reply;
  }
  questionCache.delete(key);
  return null;
}

function setCache(message, reply) {
  const key = getCacheKey(message);
  questionCache.set(key, { reply, timestamp: Date.now() });
}

// ── Per-user rate limiting (in-memory, suitable for single instance) ──────────
const userRequestCount = {};
const DAILY_LIMIT = 15; // Adjusted for 10 users: 10 × 15 = 150 req/day (90% safety buffer below 1,500 limit)

function getUserKey(req) {
  // Use IP + user-agent for basic user identification
  return `${req.ip}-${new Date().toDateString()}`;
}

function checkUserLimit(req) {
  const key = getUserKey(req);
  if (!userRequestCount[key]) userRequestCount[key] = 0;
  
  if (userRequestCount[key] >= DAILY_LIMIT) {
    return false;
  }
  userRequestCount[key]++;
  return true;
}

// ── Google Generative AI client ─────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Campus data (single source of truth — keep in sync with frontend) ────────
const CAMPUS_CONTEXT = `You are Husky, the friendly and knowledgeable AI campus guide for Northeastern University Seattle at 225 Terry Ave N, Seattle WA 98109 (South Lake Union neighborhood).
Be warm, helpful, and concise. Answer in 2–4 sentences. Always use specific space names from the list below.
If you don't know something specific, say you'd recommend checking with the front desk.

BUILDING: 225 Terry Ave N — "The Terry Thomas" building, Northeastern University Seattle.
ADDRESS: 225 Terry Ave N, Seattle, WA 98109 | South Lake Union neighborhood.

SPACES & HOURS:
- Event Space (ground floor west): Large open floor with round tables, white chairs, rainbow mural wall. Mon–Fri 7am–10pm, Sat–Sun 9am–6pm.
- Dining Area (ground floor east): Kitchen island with red bar stools, coffee station, Northeastern Global world-map wall. Mon–Fri 8am–8pm, Sat 10am–4pm, Sun closed.
- Classrooms (upper floors): Long rows of white desks, rolling chairs, multiple HD screens with NU branding, acoustic ceiling panels. Mon–Fri 8am–10pm, Sat 9am–6pm, Sun closed.
- Student Study Spaces (multiple floors): Individual desks, wooden locker walls, private phone booths, open corridors. Mon–Fri 7am–midnight, Sat–Sun 9am–10pm.
- Main Lobby & Entrance (ground floor south): Lime-green accent walls, wood-paneled elevators, live class schedule screens on red accent wall. Open 24/7, card access required after 10pm.
- Staircase (all floors): Orange accent walls, Terry Thomas energy infographic murals, connects parking P2 to roof. Always accessible.
- Upper Floor Lounge (upper floors): Globe pendant lights, tropical plants, grey sofas with yellow cushions, panoramic city views. Mon–Fri 7am–midnight, Sat–Sun 9am–10pm.
- Flex Lab / Makerspace (upper floor): Rolling butcher-block workbenches, Toolboard wall of maker equipment, 3D printer filament spools, CNC tools. Open Mon–Fri 9am–9pm, Sat 10am–5pm, Sun closed.

TRANSPORTATION:
- South Lake Union Streetcar: Terry Ave & Thomas St stop (~2 blocks walk)
- Bus routes: 40 and 62 on Westlake Ave N
- Rideshare: Drop-off on Terry Ave N frontage
- Bike parking: Courtyard and main entrance racks
- Parking: Paid garage at P2 level under the building (~$15–20/day)

PROGRAMS (Northeastern Seattle):
- Graduate programs: MS Computer Science, MS Data Science, MS Information Systems, MS Engineering Management
- Co-op: Paid 6-month placements at Amazon, Microsoft, Expedia, Boeing, and other Seattle tech companies
- Classes: Mostly Mon–Thu evenings, designed for working professionals
- Application: northeastern.edu/seattle

GENERAL:
- WiFi: NUwave network, use your Northeastern credentials
- First day tip: Check the lobby class schedule screen for your room assignment
- Emergency / campus security: ext. 911
- Main phone: (206) 370-0800
- Parking validation: Ask at the security desk
`;

// ── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Campus data endpoint (so frontend can fetch fresh data)
app.get('/api/campus', (req, res) => {
  const { buildings } = require('./data/campus');
  res.json({ buildings });
});

// Chat endpoint
app.post('/api/chat', chatLimiter, async (req, res) => {
  const { messages } = req.body;

  // Validate input
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required.' });
  }
  if (messages.length > 20) {
    return res.status(400).json({ error: 'Message history too long.' });
  }

  // Check per-user daily limit (production optimization)
  if (!checkUserLimit(req)) {
    return res.status(429).json({ 
      error: 'Daily limit reached (15 questions/day). Check back tomorrow!' 
    });
  }

  // Sanitize and validate messages — limit input to reduce token usage
  const sanitized = messages
    .filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 300) })) // Limit to 300 chars per message
    .slice(-12); // keep last 12 turns

  // Get the last user message
  const lastUserMessage = sanitized[sanitized.length - 1];
  if (!lastUserMessage || lastUserMessage.role !== 'user') {
    return res.status(400).json({ error: 'Last message must be from user.' });
  }

  try {
    // Check cache first (saves 100% of tokens on cached questions)
    const cachedReply = getFromCache(lastUserMessage.content);
    if (cachedReply) {
      return res.json({
        reply: cachedReply + ' 📋 (From cache)',
        usage: { input_tokens: 0, output_tokens: 0, cached: true }
      });
    }

    // If no API key, return a mock response for testing
    if (!process.env.GEMINI_API_KEY) {
      const mockReplies = [
        'Welcome to NUCampus360! 🎓 I\'m Husky, your campus guide. Feel free to ask me about buildings, hours, events, or anything about campus life!',
        'Great question! The Event Space is open Mon–Fri 7am–10pm, Sat–Sun 9am–6pm. Perfect for gatherings!',
        'The Dining Area features a coffee station and kitchen island. It\'s open Mon–Fri 8am–8pm, Sat 10am–4pm.',
        'You can find great study spots in our Student Study Spaces on multiple floors, open Mon–Fri 7am–midnight!',
        'The Flex Lab / Makerspace is perfect for projects. It\'s open Mon–Fri 9am–9pm, Sat 10am–5pm!'
      ];
      const reply = mockReplies[Math.floor(Math.random() * mockReplies.length)];
      return res.json({
        reply: reply + ' (Mock mode — no API key)',
        usage: { input_tokens: 0, output_tokens: 0 }
      });
    }

    // Convert message format from OpenAI to Gemini
    const history = sanitized
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      systemInstruction: CAMPUS_CONTEXT
    });

    const chat = model.startChat({
      history: history.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 800, // Full detailed responses (150 req/day = no token limit issue)
        temperature: 0.7,
      }
    });

    const response = await chat.sendMessage(lastUserMessage.content);
    const text = response.response.text();

    // Cache the response for future identical questions
    setCache(lastUserMessage.content, text);

    res.json({
      reply: text,
      usage: { 
        input_tokens: 0, 
        output_tokens: 0,
        cached: false
      }
    });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    if (err.message && err.message.includes('429')) {
      return res.status(429).json({ error: 'Gemini API is busy. Try again in a moment.' });
    }
    if (err.message && err.message.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key configuration.' });
    }
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`NUCampus360 backend running on port ${PORT}`));
module.exports = app;
