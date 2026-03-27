<p align="center">
  <img src="https://img.icons8.com/color/96/paw-print.png" alt="Goodle Logo" width="80" />
</p>

<h1 align="center">Goodle</h1>

<p align="center">
  <i>Pets are family.</i> 🐾
</p>

<p align="center">
  <b>The all-in-one platform for pet lovers.</b><br/>
  Match your furry friend, report lost pets, or adopt a new family member.
</p>

<p align="center">
  <a href="https://xungirl.github.io/neu_hackathon/">Live Demo</a> &bull;
  <a href="https://goodle-backend-779591146096.us-central1.run.app">API</a>
</p>

---

## Inspiration

Every year, millions of pets end up in shelters, and countless others go missing. We built **Goodle** because we believe technology can bridge the gap between pets in need and the people who love them. Inspired by modern social platforms, we created a Tinder-like matching experience for pet adoption, a real-time lost & found system, and an AI-powered pet profile builder — all in one place.

Our name **Goodle** comes from "Good" + "Doodle" — because every pet deserves a good life.

## Features

- **Pet Matching** — Swipe-style interface to discover pets based on breed, distance, gender, and personality. Filter in real-time.
- **Adoption Square** — Browse adoptable pets with search, breed, and age filters. Each pet has a rich detail page.
- **Lost & Found** — Report lost pets or sightings with map-based markers for quick community response.
- **AI Pet Analysis** — Upload a photo and our Gemini AI instantly detects breed, age, size, and personality traits.
- **Smart Profiles** — AI-assisted pet profile creation with auto-filled breed, color tags, and personality descriptions.
- **User Auth** — Email/password registration and login with JWT-based session management.

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** + **TypeScript** | UI framework with type safety |
| **Vite** | Fast build tool and dev server |
| **React Router** (HashRouter) | Client-side routing for GitHub Pages |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |
| **Axios** | HTTP client for API calls |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** (Python 3.11) | High-performance async API framework |
| **PostgreSQL** | Persistent relational database |
| **Google Cloud SQL** | Managed PostgreSQL in production |
| **Google Cloud Run** | Serverless container deployment |
| **psycopg2** | PostgreSQL adapter |
| **python-jose** + **bcrypt** | JWT auth and password hashing |
| **Pydantic** | Request/response validation |
| **Google Gemini AI** | Pet photo analysis and breed detection |

### Infrastructure & CI/CD
| Technology | Purpose |
|---|---|
| **GitHub Actions** | Automated frontend deployment on push |
| **GitHub Pages** | Static frontend hosting |
| **Google Cloud Run** | Backend container hosting |
| **Google Cloud SQL** | Managed PostgreSQL database |
| **Docker** | Container packaging for backend |

## Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────────┐
│  GitHub Pages    │ ──────────────▶│  Google Cloud Run    │
│  (React SPA)    │    /api/*      │  (FastAPI Backend)   │
└─────────────────┘                └──────────┬──────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │  Google Cloud SQL    │
                                   │  (PostgreSQL 15)     │
                                   └──────────┬──────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │  Google Gemini AI    │
                                   │  (Photo Analysis)    │
                                   └─────────────────────┘
```

## Project Structure

```
goodle/
├── app/                    # Backend (FastAPI)
│   ├── ai/                 # Gemini AI integration
│   ├── api/                # API route handlers
│   ├── core/               # Auth, settings, dependencies
│   ├── db/                 # Database abstraction (SQLite/PostgreSQL)
│   ├── routes/             # Auth, pets routes
│   └── main.py             # App entry point
├── src/                    # Frontend (React)
│   ├── api/                # Axios client & service layer
│   ├── assets/pets/        # Local pet images
│   ├── components/         # Navbar, Footer, shared UI
│   ├── context/            # Auth context & hooks
│   ├── pages/              # Home, Matching, Adoption, PostPet, etc.
│   ├── services/           # Mock data
│   └── types/              # TypeScript interfaces
├── .github/workflows/      # CI/CD pipeline
├── Dockerfile              # Backend container config
├── vite.config.ts          # Vite build config
└── requirements.txt        # Python dependencies
```

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL (optional, SQLite used locally)

### Frontend
```bash
npm install
npm run dev        # http://localhost:5173
```

### Backend
```bash
pip install -r requirements.txt -r requirements-backend.txt
uvicorn app.main:app --reload --port 8001
```

### Environment Variables
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (omit for SQLite) |
| `JWT_SECRET` | Secret key for JWT tokens |
| `GEMINI_API_KEY` | Google Gemini API key for AI features |
| `AI_MOCK_MODE` | Set to `1` to skip real AI calls |

## Team

Built with love at **NEU Hackathon 2026** in Seattle.

---

<p align="center">
  <i>Pets are family.</i> 🐾
</p>
