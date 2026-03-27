<p align="center">
  <img src="docs/logo.svg" alt="Goodle Logo" width="80" />
</p>

<h1 align="center">Goodle</h1>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Indie+Flower&size=28&pause=1000&color=F97316&center=true&vCenter=true&width=300&lines=Pets+are+family.+%F0%9F%90%BE" alt="Pets are family." />
</p>

<p align="center">
  <b>The all-in-one platform for pet lovers.</b><br/>
  Match your furry friend, report lost pets, or adopt a new family member today.
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
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Cloud-Run-4285F4?logo=googlecloud&logoColor=white" />
</p>

---

## 💡 Inspiration

> *"Everyone Googles for information — but who Goodles for love?"*

Every year, **6.3 million** pets enter shelters in the US alone. Countless others go missing and never find their way home. We saw a gap: there was no single platform that combined **adoption**, **lost & found**, and **social matching** for pets.

So we built **Goodle** — a Tinder-meets-Petfinder experience powered by AI. Upload a photo, and our Gemini AI tells you the breed, age, and personality in seconds. Swipe to match. Post to adopt. Pin on the map to reunite.

The name? **Good** + **Doodle** = **Goodle**. Because every pet deserves a good life. 🐕

---

## ✨ Features at a Glance

<table>
<tr>
<td align="center" width="25%">
  <h3>💘</h3>
  <b>Pet Matching</b><br/>
  <sub>Tinder-style swipe cards with real-time filters — distance, gender, personality. 18+ pet profiles across Seattle.</sub>
</td>
<td align="center" width="25%">
  <h3>🏠</h3>
  <b>Adoption Square</b><br/>
  <sub>Browse all adoptable pets. Search by name, filter by breed & age. Each pet has a rich detail page with health info.</sub>
</td>
<td align="center" width="25%">
  <h3>🗺️</h3>
  <b>Lost & Found Map</b><br/>
  <sub>Interactive Google Maps with live markers. Report lost pets with GPS, photos, and descriptions. Persistent in database.</sub>
</td>
<td align="center" width="25%">
  <h3>🤖</h3>
  <b>AI Photo Analysis</b><br/>
  <sub>Upload a pet photo → Gemini AI instantly detects breed, age, size, color, and personality traits.</sub>
</td>
</tr>
</table>

### Full Feature List

| | Feature | Details |
|---|---|---|
| 💘 | **Pet Matching** | Swipe cards, distance slider (1-100 mi), gender toggle, personality multi-select, real-time filtering |
| 🏠 | **Adoption Square** | Keyword search, breed dropdown (auto-populated), age range filter, 18+ pet cards with detail pages |
| 🗺️ | **Lost & Found Map** | Real interactive map, GPS location reports, photo upload, color/size tags, email contact |
| 🤖 | **AI Photo Analysis** | Gemini AI breed detection, age estimation, size classification, personality guess |
| 🪄 | **Smart Profiles** | AI auto-fills pet profiles from uploaded photos |
| 🔐 | **User Auth** | Email/password registration, JWT sessions, protected report submission |
| 📧 | **Contact Reporter** | One-click mailto with pre-filled subject and description |
| 📱 | **Fully Responsive** | Mobile bottom-sheet panels, touch zoom, adaptive layouts across all pages |

---

## 🗺️ Map System — Deep Dive

The Lost & Found page features a **production-grade interactive map** built for speed and usability:

### Map Technology
| Layer | Technology | Why |
|---|---|---|
| **Map Engine** | Leaflet (via CDN) | Loaded from cdnjs — not bundled in JS, instant cache hits globally |
| **Map Tiles** | Google Maps | 4 parallel subdomains (`mt0`-`mt3`) for maximum download speed |
| **Rendering** | Canvas mode | `preferCanvas={true}` — faster than SVG for many markers |
| **React Binding** | react-leaflet | Declarative markers, popups, and map events |

### Performance Optimizations
```
🚀 Preconnect      → DNS + TLS handshake starts before page needs tiles
📦 CDN Leaflet     → Not bundled in JS (saves ~140KB from main bundle)
🔄 4x Subdomains   → Browser downloads 4 tiles simultaneously from mt0-mt3
🎯 preferCanvas    → GPU-accelerated rendering for markers
💤 Lazy Loading     → Map component loaded only when user visits Lost & Found
⏸️ updateWhenIdle  → Tiles refresh only after user stops dragging
🖼️ Lazy Images     → Marker images use loading="lazy"
🗂️ Icon Cache      → Marker icons are cached in memory, not recreated
⚡ Loading Skeleton → Spinner shown while map initializes
```

### Map Features
- 📍 **GPS Reports** — Browser Geolocation API for one-tap location pinning
- 🖱️ **Click to Pin** — Or tap anywhere on the map to set report location
- 🔍 **Search & Filter** — Search by breed/location, toggle Stray vs Lost markers
- 🏷️ **Rich Popups** — Photo, description, time, color/size tags, contact button
- 📧 **Email Contact** — `mailto:` links with pre-filled report details
- 📏 **Scale Control** — Imperial + metric scale bar
- 🔄 **Persistent Data** — Reports saved to PostgreSQL, survive page refresh

### Responsive Design
| Viewport | Behavior |
|---|---|
| 🖥️ Desktop | Left sidebar panel, full-width map |
| 📱 Mobile | Bottom sheet drawer (60vh max), collapsible with drag handle, search icon toggle |
| 👆 Touch | Pinch-to-zoom, tap markers, tap-to-pin location |

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
| 🗺️ | **Leaflet** + **react-leaflet** | Interactive maps |
| 🧭 | **React Router** (HashRouter) | SPA routing for GitHub Pages |
| 🎯 | **Lucide React** | Icon library (tree-shakeable) |
| 🌐 | **Axios** | HTTP client with JWT interceptor |

</td>
<td width="50%" valign="top">

### ⚙️ Backend
| | Tech | Role |
|---|---|---|
| 🐍 | **FastAPI** (Python 3.11) | Async API framework |
| 🐘 | **PostgreSQL 15** | Relational database |
| 🤖 | **Google Gemini AI** | Photo/video analysis |
| 🔑 | **python-jose** + **bcrypt** | JWT auth + password hashing |
| 📋 | **Pydantic** | Request/response validation |
| 🔌 | **psycopg2** | PostgreSQL adapter |
| 📧 | **Email (mailto)** | Contact reporter integration |

</td>
</tr>
</table>

### ☁️ Infrastructure & CI/CD
| | Service | Role |
|---|---|---|
| 🚀 | **Google Cloud Run** | Serverless backend (auto-scales to zero) |
| 🗄️ | **Google Cloud SQL** | Managed PostgreSQL with backups |
| 📄 | **GitHub Pages** | Static frontend hosting |
| 🔄 | **GitHub Actions** | Auto-deploy frontend on push to main |
| 🐳 | **Docker** | Backend containerization |
| 🗺️ | **Google Maps Tiles** | Map imagery via 4-subdomain CDN |
| 📦 | **cdnjs** | Leaflet library CDN delivery |

---

## 🏗 Architecture

```
  ┌──────────────────┐                           ┌──────────────────────┐
  │                  │  ──── /api/auth/* ──────▶  │                      │
  │  GitHub Pages    │  ──── /api/pets/* ──────▶  │  Google Cloud Run    │
  │  (React SPA)     │  ──── /api/reports/* ───▶  │  (FastAPI + Docker)  │
  │                  │  ◀──── JSON ────────────  │                      │
  └───────┬──────────┘                           └──────────┬───────────┘
          │                                                 │
          │  Map Tiles                            ┌─────────▼──────────┐
          │                                       │  Google Cloud SQL   │
  ┌───────▼──────────┐                            │  PostgreSQL 15      │
  │  Google Maps CDN  │                            │  • users            │
  │  mt0/mt1/mt2/mt3  │                            │  • pets             │
  └──────────────────┘                            │  • reports          │
                                                  └─────────┬──────────┘
                                                            │
                                                  ┌─────────▼──────────┐
                                                  │  Google Gemini AI   │
                                                  │  Photo Analysis     │
                                                  └────────────────────┘
```

---

## 📂 Project Structure

```
goodle/
├── 🐍 app/                        # Backend (FastAPI)
│   ├── ai/                        #   Gemini AI clients & analyzers
│   ├── api/                       #   AI route handlers
│   ├── core/                      #   Auth, settings, deps
│   ├── db/                        #   Database (auto SQLite/PostgreSQL)
│   ├── routes/                    #   auth.py, pets.py, reports.py
│   └── main.py                    #   App entry & table init
├── ⚛️ src/                         # Frontend (React + TypeScript)
│   ├── api/services/              #   Axios: auth, pets, reports, ai
│   ├── assets/pets/               #   Local pet images (12 files)
│   ├── components/                #   Navbar, Footer, AI matchers
│   ├── context/                   #   Auth context + useAuth hook
│   ├── pages/                     #   Home, Matching, LostFound,
│   │                              #   Adoption, PetDetails, PostPet,
│   │                              #   Login, Register
│   ├── services/                  #   Mock data (18 pets, 6 markers)
│   └── types/                     #   TypeScript interfaces
├── 🔄 .github/workflows/          # GitHub Actions CI/CD
├── 🐳 Dockerfile                  # Python 3.11-slim container
├── ⚡ vite.config.ts              # Build config (Leaflet external)
└── 📋 requirements.txt            # Python dependencies
```

---

## 🚀 Getting Started

### Prerequisites
> Node.js 20+ &bull; Python 3.11+ &bull; PostgreSQL *(optional — SQLite works locally)*

### Frontend
```bash
npm install
npm run dev              # → http://localhost:5173
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
| `AI_MOCK_MODE` | `1` = skip real AI calls | Development |

---

## 📱 Responsive Design

Every page is built **mobile-first** with Tailwind breakpoints:

| Page | Mobile | Desktop |
|---|---|---|
| **Home** | Stacked hero + cards | Side-by-side layout |
| **Matching** | Full-width card, hidden sidebar | 3-column: filters / card / info |
| **Lost & Found** | Bottom sheet panel, touch zoom | Left sidebar, mouse scroll zoom |
| **Adoption** | 1-column grid | 4-column grid with filter bar |
| **Pet Details** | Stacked image + info | 2-column gallery + details |
| **Auth Pages** | Centered card | Centered card |

---

## 👥 Team

Built with ❤️ and ☕ at **NEU Hackathon 2026** in Seattle, WA.

We're a team of pet lovers who believe technology should make the world better — one paw at a time.

---

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Indie+Flower&size=22&pause=2000&color=F97316&center=true&vCenter=true&width=250&lines=Pets+are+family.+%F0%9F%90%BE" alt="Pets are family." />
</p>

<p align="center">
  <sub>Made with 🧡 by the Goodle team &bull; NEU Hackathon 2026</sub>
</p>
