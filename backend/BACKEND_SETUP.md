# NUCampus360 Backend - Setup & Deployment

## Local Development

### Prerequisites
- Node.js 18+ 
- Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Then edit .env and add your GEMINI_API_KEY
```

### Running Locally

```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Run tests
npm test
```

Server will start on `http://localhost:3001`

---

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

### Campus Data
```
GET /api/campus
```
Returns building information.

### Chat (Gemini AI)
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "What are the campus hours?" }
  ]
}
```

**Rate Limiting:**
- 15 requests per user per day
- 10 requests per minute (burst limit)
- 10 concurrent users supported

---

## Production Deployment

### Render.com (Recommended)

1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Set environment variables in Render dashboard:
   - `GEMINI_API_KEY` = your API key
   - `NODE_ENV` = production
   - `ALLOWED_ORIGINS` = your frontend URL

### Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| GEMINI_API_KEY | AIzaSy... | Yes |
| PORT | 3001 | No (defaults to 3001) |
| NODE_ENV | production | No |
| ALLOWED_ORIGINS | https://app.vercel.app | No |

---

## Key Features

✅ Gemini AI Integration (gemini-flash-latest)
✅ Request Caching (24-hour TTL)
✅ Rate Limiting (15 req/user/day)
✅ Security: Helmet.js, CORS, Input validation
✅ Response: max 800 tokens (full detailed answers)

---

## File Structure

```
backend/
├── server.js           # Main Express app
├── package.json        # Dependencies
├── .env               # Local config (NOT in git)
├── .env.example       # Config template for others
├── data/              # Campus data JSON files
├── __tests__/         # Unit tests (Jest)
└── jest.config.js     # Test configuration
```

---

## Monitoring

Check server health:
```bash
curl http://localhost:3001/api/health
```

Test chat endpoint:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hi!"}]}'
```

---

## Cost & Quotas

- **Free Tier:** 1,500 requests/day
- **Your Config:** 150 requests/day (10% usage)
- **Cost:** FREE
- **Upgrade:** Only if you exceed 1,500 req/day

---

## Troubleshooting

**Port already in use:**
```bash
taskkill /F /IM node.exe
```

**API key invalid:**
- Get new key: https://aistudio.google.com/app/apikey
- Update `.env` file

**CORS errors:**
- Check `ALLOWED_ORIGINS` in .env
- Add your frontend URL to the list

---

## Support

For issues, check:
1. `.env` file has valid `GEMINI_API_KEY`
2. Dependencies installed: `npm install`
3. Node.js version: `node --version` (must be 18+)
