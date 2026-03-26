# NUCampus360 - Complete Project Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Core Business Logic](#core-business-logic)
- [Data Structure Design](#data-structure-design)
- [API Interface Design](#api-interface-design)
- [Frontend Page Design](#frontend-page-design)
- [Deployment Guide](#deployment-guide)
- [User Guide](#user-guide)
- [Development Guide](#development-guide)
- [Security and Testing](#security-and-testing)
- [Future Plans](#future-plans)
- [License](#license)

---

## Project Overview

NUCampus360 is an interactive web application combining a live campus map, 360-degree building tours, and an AI-powered campus guide. It was designed to provide a comprehensive virtual experience for the Northeastern University Seattle campus, originally built for the Emerald Forge Hackathon, March 2026.

### Core Features

-   **Interactive Map**: Clickable markers for major campus buildings utilizing geographic data.
-   **Virtual 360 Tours**: Immersive panoramic viewer for building interiors and exteriors.
-   **AI Campus Guide**: Conversational assistant answering queries regarding building locations, operating hours, and academic programs.
-   **Responsive Interface**: Fluid design ensuring compatibility across mobile and desktop environments.

### Project Highlights

-   Zero ongoing cost at demonstration scale through strategic use of free-tier cloud hosting.
-   No API keys required for mapping infrastructure (OpenStreetMap).
-   High-performance frontend built with modern build tools.
-   Secure backend proxying for AI service interactions.

---

## Technology Stack

### Frontend Technologies

-   **React 18**: UI component library
-   **Vite**: Build tool and development server
-   **Leaflet.js & OpenStreetMap**: Interactive mapping infrastructure
-   **Pannellum**: Equirectangular 360-degree panorama viewer
-   **CSS3/HTML5**: Styling and structure

### Backend Technologies

-   **Node.js 18+**: Runtime environment
-   **Express.js**: Web application framework
-   **Helmet.js**: HTTP header security

### External Services & APIs

-   **Gemini API (Google)**: Large language model for the AI guide
-   **Cloudinary (Optional)**: Hosting for equirectangular panoramic images

### Infrastructure & Deployment

-   **Vercel**: Frontend hosting and edge network
-   **Render**: Backend service hosting
-   **GitHub Actions**: Continuous Integration pipeline

---

## System Architecture

### Overall Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           NUCampus360                           │
│                       System Architecture                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │ External APIs   │
│  (React/Vite)   │    │ (Node/Express)  │    │  & Storage      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ REST /api             │ Secure API Calls      │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • MapPanel      │    │ • API Routes    │    │ • Gemini API    │
│ • ChatPanel     │    │ • Rate Limiter  │    │ • OpenStreetMap │
│ • TourPanel     │    │ • Data Access   │    │ • Cloudinary    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Layered Architecture Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    Layered Architecture Design                  │
└─────────────────────────────────────────────────────────────────┘

Presentation Layer (Frontend)
├── App Container
│   ├── Navigation
│   ├── Map Component (Leaflet)
│   ├── 360 Viewer (Pannellum)
│   └── Chat Interface

API Gateway / Application Layer (Backend)
├── Express Server
│   ├── CORS & Security Middleware
│   ├── Rate Limiting
│   └── Route Handlers (/api/campus, /api/chat)

Data Layer
├── Static Data Models
│   └── campus.js (Building data, coordinates, tour URLs)
└── AI Knowledge Base
    └── System Context Prompts
```

---

## Core Business Logic

### AI Chat Assistant Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      AI Chat Assistant Flow                     │
└─────────────────────────────────────────────────────────────────┘

User Input
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Input       │───▶│ Backend     │───▶│ Gemini API  │
│ Validation  │    │ Rate Limit  │    │ Processing  │
│ (Frontend)  │    │ & Auth      │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
    ┌───────────────────────────────────────┘
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Format      │───▶│ Transmit    │───▶│ Update UI   │
│ Response    │    │ via REST    │    │ Chat History│
│ (Backend)   │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Virtual Tour Rendering Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Virtual Tour Rendering Flow                  │
└─────────────────────────────────────────────────────────────────┘

Select Building on Map
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Fetch       │───▶│ Validate    │───▶│ Initialize  │
│ Building    │    │ Image URLs  │    │ Pannellum   │
│ Metadata    │    │             │    │ Viewer      │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
    ┌───────────────────────────────────────┘
    ▼
┌─────────────┐    ┌─────────────┐
│ Download    │───▶│ Render      │
│ Equirectan- │    │ Interactive │
│ gular Image │    │ 360 Canvas  │
└─────────────┘    └─────────────┘
```

---

## Data Structure Design

Instead of a relational database, the system relies on a high-performance, statically defined JSON structure (`campus.js`) to ensure zero latency for map initialization and fallback states.

### Campus Building Model

```json
{
  "id": "string (unique identifier)",
  "name": "string (display name)",
  "coordinates": {
    "lat": "float",
    "lng": "float"
  },
  "description": "string",
  "hours": "string",
  "amenities": ["string"],
  "tourImages": ["url_string"]
}
```

---

## API Interface Design

### 1. Get Campus Data

-   **Endpoint**: `GET /api/campus`
-   **Description**: Retrieves metadata, coordinates, and tour image URLs for all campus buildings.
-   **Response**: `200 OK` (Returns Array of Campus Building Objects)

### 2. AI Chat Interaction

-   **Endpoint**: `POST /api/chat`
-   **Description**: Processes user queries through the Gemini API with injected campus context.
-   **Body**: `{"message": "string", "history": []}`
-   **Response**: `200 OK` (Returns AI text response)

---

## Frontend Page Design

### Page Structure Design

```
┌─────────────────────────────────────────────────────────────────┐
│                      Page Structure Design                      │
└─────────────────────────────────────────────────────────────────┘

App Root
├── Navigation Bar (Header)
│
├── Left Column (Interactive Visuals)
│   ├── MapPanel (Leaflet Viewport)
│   └── PhotoModal/TourPanel (Pannellum Overlay)
│
└── Right Column (Information & Interaction)
    └── ChatPanel (AI Interface & Message History)
```

### Page Functions

-   **Map Panel**: Displays global view of campus. Users click markers to trigger building-specific data and tours.
-   **Chat Panel**: Maintains conversation history. Users can ask natural language questions about the campus.
-   **Tour Panel**: Modal overlay activated when a user selects a building with available 360-degree photography.

---

## Deployment Guide

### Environment Requirements

-   Node.js: 18+
-   NPM or Yarn
-   Gemini API Key

### Local Development Setup

#### Clone and Install Dependencies

```bash
git clone https://github.com/YOUR_ORG/nucampus360.git
cd nucampus360

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

#### Configuration

```bash
cd backend
cp .env.example .env
# Open .env and set GEMINI_API_KEY=your_key_here
```

#### Start Development Servers

```bash
# Terminal 1 - Backend (Port 3001)
cd backend && npm run dev

# Terminal 2 - Frontend (Port 5173)
cd frontend && npm run dev
```

### Production Deployment

#### Backend (Render.com)

1.  Connect repository to Render as a New Web Service.
2.  Apply `render.yaml` configuration.
3.  Set Environment Variables:
    -   `GEMINI_API_KEY`: [Your Key]
    -   `ALLOWED_ORIGINS`: [Your Vercel Domain]

#### Frontend (Vercel)

1.  Import repository to Vercel, setting **Root Directory** to `frontend`.
2.  Set Environment Variable:
    -   `VITE_API_URL`: `/api`
3.  Update `vercel.json` rewrite rules to point to the deployed Render backend URL.

---

## User Guide

### Map Navigation

-   Pan and zoom the map using standard mouse controls or touch gestures.
-   Click on specific building markers to view the building name and trigger associated actions.

### Taking Virtual Tours

-   When a building marker is clicked, select the "View 360 Tour" option if available.
-   Click and drag inside the Pannellum viewer to look around the panorama.

### Using the AI Guide

-   Type questions into the chat input field on the right side of the screen.
-   Ask about building hours, directions, academic programs, or general campus information.
-   The AI retains conversation history for context during a single session.

---

## Development Guide

### Project Structure

```
nucampus360/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/       # UI Components
│   │   ├── data/             # Fallback data
│   │   ├── App.jsx           # Root application
│   │   └── styles.css        # Global styling
│   ├── vercel.json           # Deployment and proxy config
│   └── vite.config.js
│
├── backend/                  # Node.js + Express application
│   ├── data/
│   │   └── campus.js         # Core campus data store
│   ├── __tests__/            # Test suites
│   └── server.js             # API and application logic
│
├── render.yaml               # Backend deployment configuration
└── .github/workflows/        # CI/CD pipelines
```

### Updating Campus Information

All static data regarding the campus is maintained in `backend/data/campus.js`. To update building hours, descriptions, or coordinates, edit this file and redeploy the backend.

### Adding 360 Degree Tours

1.  Capture an equirectangular panorama.
2.  Host the image via a CDN or image hosting service (e.g., Cloudinary).
3.  Open `backend/data/campus.js`.
4.  Add the image URL to the `tourImages` array for the respective building.

---

## Security and Testing

### Security Measures

-   **API Key Isolation**: The Gemini API key is strictly maintained on the backend server and is never exposed to the client browser.
-   **Rate Limiting**: Implemented on the backend (60 requests/15 minutes globally, 10 requests/minute for chat) to prevent abuse.
-   **CORS Configuration**: Cross-Origin Resource Sharing is strictly limited to the defined frontend production domain.
-   **Input Sanitization**: Chat messages are length-capped and role-validated prior to API submission.
-   **HTTP Security**: `Helmet.js` is utilized to set secure HTTP headers.

### Testing

Automated tests evaluate health endpoints, data integrity, chat input validation, and 404 handling.

```bash
cd backend
npm test
```

---

## Future Plans

### Feature Extensions

-   Add real equirectangular photos for all major campus buildings.
-   Confirm and update exact GPS coordinates for higher map precision.
-   Implement indoor wayfinding for step-by-step directions between buildings.
-   Integrate a live events feed using a campus calendar API.

### Accessibility and Localization

-   Enhance accessibility mode with screen-reader-compatible map labels (ARIA).
-   Add multilingual AI responses (Spanish, Mandarin, Korean).

### Technical Upgrades

-   Develop an admin dashboard for non-technical users to update campus data without modifying code.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
