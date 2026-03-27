<p align="center">
  <img src="https://raw.githubusercontent.com/xungirl/neu_hackathon/main/docs/logo.png" alt="Goodle" width="280" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Indie+Flower&size=28&pause=1000&color=C4956A&center=true&vCenter=true&width=300&lines=Pets+are+family.+%F0%9F%90%BE" alt="Pets are family." />
</p>

<p align="center">
  <b>The all-in-one platform for pet lovers.</b>
</p>

<p align="center">
  <a href="https://xungirl.github.io/neu_hackathon/"><img src="https://img.shields.io/badge/%F0%9F%8C%90_Live_Demo-Visit_Now-C4956A?style=for-the-badge" alt="Live Demo" /></a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://goodle-backend-779591146096.us-central1.run.app"><img src="https://img.shields.io/badge/%F0%9F%93%A2_Report-Lost_Pet-8FA5B2?style=for-the-badge" alt="Report" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-A3B5C7?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-8FA5B2?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.116-9BB5A0?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-8FA5B2?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-B5A0C4?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/MapLibre_GL-Vector-9BB5A0?logo=maplibre&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-3-A3B5C7?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Cloud-Run-C4956A?logo=googlecloud&logoColor=white" />
</p>

---

## 💡 Inspiration

> *"Everyone Googles for information — but who Goodles for love?"*

Every year, **6.3 million** pets enter shelters in the US alone. Countless others go missing and never find their way home.

The idea for Goodle was inspired by **Kimberlyn**, whose passion for animal welfare showed us that technology can bridge the gap between pets in need and the people who love them. We built a Tinder-meets-Petfinder experience powered by AI — upload a photo, and Gemini tells you the breed, age, and personality in seconds. Swipe to match. Post to adopt. Pin on the map to reunite.

**Good** + **Doodle** = **Goodle** — because every pet deserves a good life. 🐕

---

## ✨ Features

> **💘 Pet Matching** — Swipe cards with distance, gender & personality filters across Seattle
>
> **🏠 Adoption Square** — Search by breed & age, rich detail pages with health & activity info
>
> **🗺️ Lost & Found** — WebGL vector map, GPS reports with photo upload, persistent in PostgreSQL
>
> **🤖 AI Analysis** — Gemini detects breed, age, size & personality from a single photo
>
> **🔐 Auth** — JWT email/password, required for reports &nbsp;&bull;&nbsp; **📧 Contact** — Pre-filled mailto &nbsp;&bull;&nbsp; **📱 Responsive** — Mobile-first on all pages

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

    style A fill:#A3B5C7,color:#fff
    style D fill:#9BB5A0,color:#fff
    style I fill:#8FA5B2,color:#fff
    style J fill:#B5A0C4,color:#fff
    style K fill:#9BB5A0,color:#fff
    style B fill:#9BB5A0,color:#fff
```

---

## 🗺️ Map Evolution — From Slow to Smooth

Building a fast interactive map was one of our biggest technical challenges.

### The Problem

Our initial implementation used **Leaflet + raster PNG tiles**. Every zoom or pan triggered dozens of 256×256 pixel image downloads — visible "block-by-block" loading with 3-5 second initial load times.

### Our Journey

```mermaid
graph LR
    A[v1: Leaflet<br/>+ OSM Tiles<br/>❌ Very Slow] --> B[v2: Leaflet<br/>+ CARTO Tiles<br/>⚠️ Still Blocky]
    B --> C[v3: Leaflet<br/>+ Google Tiles<br/>⚠️ Faster CDN<br/>Still Raster]
    C --> D[v4: MapLibre GL<br/>+ Vector Tiles<br/>✅ Smooth!]

    style A fill:#C4956A,color:#fff
    style B fill:#B5A0C4,color:#fff
    style C fill:#A3B5C7,color:#fff
    style D fill:#9BB5A0,color:#fff
```

### Raster vs Vector — Why We Switched

> ❌ **Raster** (PNG tiles): 15-25 KB each, CPU rendered, block-by-block loading
>
> ✅ **Vector** (PBF tiles): 2-5 KB each, WebGL GPU rendered, 60fps smooth zoom

### 9 Optimizations Across 4 Versions

> `lazy loading` → `preconnect` → `4× parallel CDN` → `canvas GPU` → `idle updates` → `icon cache` → `no animations` → **`vector tiles`** → `skeleton UI`

**Final stack:** MapLibre GL JS &bull; CARTO Voyager vectors &bull; WebGL &bull; Protocol Buffers

---

## 🛠 Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/-React-A3B5C7?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/-TypeScript-8FA5B2?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/-Vite-B5A0C4?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/-Tailwind-9BB5A0?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/-MapLibre-9BB5A0?style=flat-square&logo=maplibre&logoColor=white" />
  <img src="https://img.shields.io/badge/-Axios-A3B5C7?style=flat-square&logo=axios&logoColor=white" />
  <img src="https://img.shields.io/badge/-Lucide-C4956A?style=flat-square&logo=lucide&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/-FastAPI-9BB5A0?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/-Python-A3B5C7?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/-PostgreSQL-8FA5B2?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/-Gemini_AI-B5A0C4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/-Docker-8FA5B2?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/-Pydantic-C4956A?style=flat-square&logo=pydantic&logoColor=white" />
</p>

### ☁️ Infrastructure

<p align="center">
  <img src="https://img.shields.io/badge/-Google_Cloud_Run-C4956A?style=flat-square&logo=googlecloud&logoColor=white" />
  <img src="https://img.shields.io/badge/-Cloud_SQL-8FA5B2?style=flat-square&logo=googlecloud&logoColor=white" />
  <img src="https://img.shields.io/badge/-GitHub_Pages-9BB5A0?style=flat-square&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/-GitHub_Actions-B5A0C4?style=flat-square&logo=githubactions&logoColor=white" />
  <img src="https://img.shields.io/badge/-Docker-8FA5B2?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/-CARTO_CDN-9BB5A0?style=flat-square&logo=carto&logoColor=white" />
</p>

---

## 📱 Responsive Design

```mermaid
graph LR
    subgraph "📱 Mobile"
        M1[Bottom Sheet Panel]
        M2[Single Column Grid]
        M3[Touch Pinch Zoom]
        M4[Collapsible Filters]
    end

    subgraph "🖥️ Desktop"
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

```bash
# Frontend
npm install && npm run dev       # → http://localhost:5173

# Backend
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

## 👥 Team & Acknowledgements

Built with ❤️ at **Seattle Hackathon 2026** — fueled by late-night coffee, pixel-perfect dreams, and the wagging tails that kept us going.

This project exists because of **[Kimberlyn](https://www.linkedin.com/in/manqiu-yang-3b6a46311)** — the kind of person who stops for every stray, remembers every shelter dog's name, and believes no pet should ever feel unloved. Her heart for animals became our north star. This one's for you, K.

We didn't just build an app. We built a love letter to every pet still waiting by the window for someone to come home. 🐾

---

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Indie+Flower&size=22&pause=2000&color=C4956A&center=true&vCenter=true&width=250&lines=Pets+are+family.+%F0%9F%90%BE" alt="Pets are family." />
</p>

<p align="center">
  <sub>Made with 🧡 by the Goodle team &bull; Seattle Hackathon 2026</sub>
</p>
