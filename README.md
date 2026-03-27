<p align="center">
  <img src="docs/logo.svg" alt="Goodle Logo" width="80" />
</p>

<h1 align="center">Goodle</h1>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Indie+Flower&size=28&pause=1000&color=F97316&center=true&vCenter=true&width=300&lines=Pets+are+family.+%F0%9F%90%BE" alt="Pets are family." />
</p>

<p align="center">
  <b>The all-in-one platform for pet lovers.</b><br/>
  Match. Report. Adopt. Reunite. — All powered by AI.
</p>

<p align="center">
  <a href="https://xungirl.github.io/neu_hackathon/"><img src="https://img.shields.io/badge/%F0%9F%8C%90_Live_Demo-Visit_Now-F97316?style=for-the-badge" alt="Live Demo" /></a>
  &nbsp;
  <a href="https://goodle-backend-779591146096.us-central1.run.app"><img src="https://img.shields.io/badge/%F0%9F%94%97_API-Cloud_Run-4285F4?style=for-the-badge" alt="API" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-8E75B2?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/MapLibre_GL-Vector-199900?logo=maplibre&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Cloud-Run-4285F4?logo=googlecloud&logoColor=white" />
</p>

---

## 💡 Inspiration

> *"Everyone Googles for information — but who Goodles for love?"*

Every year, **6.3 million** pets enter shelters in the US alone. Countless others go missing and never find their way home. We saw a gap: there was no single platform that combined **adoption**, **lost & found**, and **social matching** for pets.

So we built **Goodle** — a Tinder-meets-Petfinder experience powered by AI. Upload a photo, and our Gemini AI tells you the breed, age, and personality in seconds. Swipe to match. Post to adopt. Pin on the map to reunite.

**Good** + **Doodle** = **Goodle** — because every pet deserves a good life. 🐕

---

## ✨ Features

<table>
<tr>
<td align="center" width="25%">
  <h3>💘</h3>
  <b>Pet Matching</b><br/>
  <sub>Swipe cards with real-time filters — distance, gender, personality. 18+ profiles across Seattle.</sub>
</td>
<td align="center" width="25%">
  <h3>🏠</h3>
  <b>Adoption Square</b><br/>
  <sub>Search, filter by breed & age. Rich detail pages with health info, activity levels, and owner contact.</sub>
</td>
<td align="center" width="25%">
  <h3>🗺️</h3>
  <b>Lost & Found Map</b><br/>
  <sub>Vector map with GPS reports, photo upload, color/size tags. Persistent in PostgreSQL database.</sub>
</td>
<td align="center" width="25%">
  <h3>🤖</h3>
  <b>AI Photo Analysis</b><br/>
  <sub>Gemini AI detects breed, age, size, color, and personality from a single photo.</sub>
</td>
</tr>
</table>

| | Feature | Details |
|---|---|---|
| 💘 | **Pet Matching** | Swipe cards, distance slider (1–100 mi), gender toggle, personality multi-select |
| 🏠 | **Adoption Square** | Keyword search, breed dropdown, age filter, detail pages with activity/sociability bars |
| 🗺️ | **Lost & Found** | Vector map (MapLibre GL), GPS reports, photo upload, color/size, email contact |
| 🤖 | **AI Analysis** | Gemini AI breed detection, age estimation, personality guess from photo |
| 🔐 | **Auth** | Email/password JWT auth, required for report submission |
| 📧 | **Contact** | Pre-filled mailto links for instant reporter communication |
| 📱 | **Responsive** | Mobile bottom-sheet, touch zoom, adaptive grids on every page |

---

## 🏗 System Architecture

```mermaid
graph TB
    subgraph "Frontend — GitHub Pages"
        A[React SPA<br/>TypeScript + Vite] --> B[MapLibre GL<br/>WebGL Vector Map]
        A --> C[Axios HTTP Client<br/>JWT Interceptor]
    end

    subgraph "Backend — Google Cloud Run"
        D[FastAPI<br/>Python 3.11] --> E[Auth API<br/>JWT + bcrypt]
        D --> F[Pets API<br/>CRUD]
        D --> G[Reports API<br/>Lost & Found]
        D --> H[AI API<br/>Gemini Integration]
    end

    subgraph "Data Layer"
        I[(PostgreSQL 15<br/>Google Cloud SQL)]
        J[Google Gemini AI<br/>Photo Analysis]
    end

    subgraph "Map Infrastructure"
        K[CARTO Vector Tiles<br/>CDN]
    end

    C -->|HTTPS /api/*| D
    E --> I
    F --> I
    G --> I
    H --> J
    B --> K

    style A fill:#61DAFB,color:#000
    style D fill:#009688,color:#fff
    style I fill:#4169E1,color:#fff
    style J fill:#8E75B2,color:#fff
    style K fill:#199900,color:#fff
    style B fill:#199900,color:#fff
```

---

## 🗺️ Map Evolution — From Slow to Smooth

Building a fast interactive map was one of our biggest technical challenges. Here's the journey:

### The Problem

Our initial implementation used **Leaflet + raster PNG tiles**. Every zoom or pan triggered dozens of 256×256 pixel image downloads. The result: visible "block-by-block" loading and 3-5 second initial load times.

### What We Tried

```mermaid
graph LR
    A[v1: Leaflet<br/>+ OSM Tiles<br/>❌ Very Slow] --> B[v2: Leaflet<br/>+ CARTO Tiles<br/>⚠️ Still Blocky]
    B --> C[v3: Leaflet<br/>+ Google Tiles<br/>⚠️ Faster CDN<br/>Still Raster]
    C --> D[v4: MapLibre GL<br/>+ Vector Tiles<br/>✅ Smooth!]

    style A fill:#EF4444,color:#fff
    style B fill:#F97316,color:#fff
    style C fill:#EAB308,color:#000
    style D fill:#22C55E,color:#fff
```

### Why Vector Tiles Win

```
                    Raster (PNG)          Vector (PBF)
    ┌──────────────┬──────────────────┬──────────────────┐
    │ Tile Size    │  15-25 KB each   │  2-5 KB each     │
    │ Zoom         │  Reload new PNGs │  GPU re-renders   │
    │ Rendering    │  CPU (DOM/Canvas)│  WebGL (GPU)      │
    │ Smoothness   │  Block-by-block  │  Silky smooth     │
    │ Rotation     │  Not supported   │  Full 3D support  │
    │ Labels       │  Baked in image  │  Dynamic/crisp    │
    └──────────────┴──────────────────┴──────────────────┘
```

### All Optimizations Applied

| # | Optimization | Impact | Stage |
|---|---|---|---|
| 1 | `React.lazy()` map component | Map JS only loads when page visited | v1 |
| 2 | `preconnect` to tile CDN in HTML `<head>` | Saves ~200ms DNS+TLS handshake | v1 |
| 3 | Multiple tile subdomains (`mt0-mt3`) | 4× parallel downloads | v3 |
| 4 | `preferCanvas={true}` | GPU-accelerated marker rendering | v2 |
| 5 | `updateWhenIdle` / `updateWhenZooming=false` | No tile fetch during interaction | v2 |
| 6 | Marker icon caching (memory `Map`) | No DOM recreation for same icons | v2 |
| 7 | Remove CSS ping animations | Eliminates constant GPU repaints | v2 |
| 8 | **Switch to MapLibre GL + vector tiles** | **5-10× smaller data, WebGL smooth** | **v4** |
| 9 | Loading skeleton with spinner | No white screen during init | v1 |

### Final Stack

| Component | Technology | Why |
|---|---|---|
| **Map Engine** | MapLibre GL JS | Free, WebGL, vector rendering |
| **Tile Source** | CARTO Voyager (vector) | Beautiful style, fast CDN, free |
| **Tile Format** | Protocol Buffers (.pbf) | 5× smaller than PNG tiles |
| **Rendering** | WebGL (GPU) | 60fps zoom/pan, no block artifacts |
| **Markers** | Custom HTML elements | Circular pet photos with colored borders |
| **Popups** | MapLibre native popups | Photo, description, mailto contact |

---

## 🛠 Tech Stack

<table>
<tr>
<td width="50%" valign="top">

### 🎨 Frontend
| | Tech | Role |
|---|---|---|
| ⚛️ | **React 18** + **TypeScript** | UI framework |
| ⚡ | **Vite** | Build tool (code-split, tree-shake) |
| 🎨 | **Tailwind CSS** | Utility-first responsive styling |
| 🗺️ | **MapLibre GL JS** | Vector map (WebGL) |
| 🧭 | **React Router** (HashRouter) | SPA routing |
| 🎯 | **Lucide React** | Icons (tree-shakeable) |
| 🌐 | **Axios** | HTTP client with JWT interceptor |

</td>
<td width="50%" valign="top">

### ⚙️ Backend
| | Tech | Role |
|---|---|---|
| 🐍 | **FastAPI** (Python 3.11) | Async API framework |
| 🐘 | **PostgreSQL 15** | Database (users, pets, reports) |
| 🤖 | **Google Gemini AI** | Photo/video analysis |
| 🔑 | **python-jose** + **bcrypt** | JWT auth + password hashing |
| 📋 | **Pydantic** | Request/response validation |
| 🔌 | **psycopg2** | PostgreSQL adapter |

</td>
</tr>
</table>

### ☁️ Infrastructure
| | Service | Role |
|---|---|---|
| 🚀 | **Google Cloud Run** | Serverless backend (auto-scales) |
| 🗄️ | **Google Cloud SQL** | Managed PostgreSQL |
| 📄 | **GitHub Pages** | Frontend hosting |
| 🔄 | **GitHub Actions** | CI/CD on push to main |
| 🐳 | **Docker** | Backend container |
| 🗺️ | **CARTO CDN** | Vector tile delivery |

---

## 📱 Responsive Design

Every page adapts from mobile to desktop:

```mermaid
graph LR
    subgraph "Mobile (< 768px)"
        M1[Bottom Sheet Panel]
        M2[Single Column Grid]
        M3[Touch Pinch Zoom]
        M4[Collapsible Filters]
    end

    subgraph "Desktop (≥ 768px)"
        D1[Left Sidebar Panel]
        D2[4-Column Grid]
        D3[Mouse Scroll Zoom]
        D4[Always-Visible Filters]
    end

    M1 -.->|breakpoint| D1
    M2 -.->|breakpoint| D2
    M3 -.->|breakpoint| D3
    M4 -.->|breakpoint| D4
```

| Page | Mobile | Desktop |
|---|---|---|
| **Home** | Stacked hero + cards | Side-by-side layout |
| **Matching** | Full-width card | 3-column: filters / card / info |
| **Lost & Found** | Bottom drawer (60vh), touch zoom | Left sidebar, scroll zoom |
| **Adoption** | 1-col grid, stacked filters | 4-col grid, inline filter bar |
| **Pet Details** | Stacked image + info | 2-column gallery + details |

---

## 📂 Project Structure

```
goodle/
├── 🐍 app/                        # Backend (FastAPI)
│   ├── ai/                        #   Gemini AI clients
│   ├── api/                       #   AI route handlers
│   ├── core/                      #   Auth, settings, deps
│   ├── db/                        #   Database (SQLite / PostgreSQL)
│   ├── routes/                    #   auth.py, pets.py, reports.py
│   └── main.py                    #   App entry + table init
├── ⚛️ src/                         # Frontend (React + TS)
│   ├── api/services/              #   auth, pets, reports, ai
│   ├── assets/pets/               #   12 local pet images
│   ├── components/                #   Navbar, Footer, AI matchers
│   ├── context/                   #   Auth context + hook
│   ├── pages/                     #   8 page components
│   ├── services/                  #   Mock data (18 pets, 6 markers)
│   └── types/                     #   TypeScript interfaces
├── .github/workflows/             #   CI/CD pipeline
├── Dockerfile                     #   Python 3.11-slim container
├── vite.config.ts                 #   Build config
└── requirements.txt               #   Python deps
```

---

## 🚀 Getting Started

### Prerequisites
> Node.js 20+ &bull; Python 3.11+ &bull; PostgreSQL *(optional)*

### Frontend
```bash
npm install && npm run dev       # → http://localhost:5173
```

### Backend
```bash
pip install -r requirements.txt -r requirements-backend.txt
uvicorn app.main:app --reload --port 8001
```

### 🔑 Environment Variables
| Variable | Description | When |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Production |
| `JWT_SECRET` | JWT signing secret | Always |
| `GEMINI_API_KEY` | Google Gemini API key | AI features |
| `AI_MOCK_MODE` | `1` = mock AI responses | Dev only |

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        timestamp created_at
    }

    PETS {
        string id PK
        string user_id FK
        string name
        string breed
        string size
        string gender
        int age
        boolean vaccinated
        boolean neutered
        json personality_tags
        json photos
        string bio
        timestamp created_at
    }

    REPORTS {
        int id PK
        string user_id FK
        float lat
        float lng
        string type
        string pet_name
        string description
        string color
        string size
        string photo_url
        timestamp created_at
    }

    USERS ||--o{ PETS : creates
    USERS ||--o{ REPORTS : submits
```

---

## 👥 Team

Built with ❤️ and ☕ at **NEU Hackathon 2026** in Seattle, WA.

A team of pet lovers who believe technology should make the world better — one paw at a time.

---

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Indie+Flower&size=22&pause=2000&color=F97316&center=true&vCenter=true&width=250&lines=Pets+are+family.+%F0%9F%90%BE" alt="Pets are family." />
</p>

<p align="center">
  <sub>Made with 🧡 by the Goodle team &bull; NEU Hackathon 2026</sub>
</p>
