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
  <img src="https://img.shields.io/badge/Google_Cloud-Run-4285F4?logo=googlecloud&logoColor=white" />
</p>

---

## 💡 Inspiration

> *"Everyone Googles for information — but who Goodles for love?"*

Every year, **6.3 million** pets enter shelters in the US alone. Countless others go missing and never find their way home. We saw a gap: there was no single platform that combined **adoption**, **lost & found**, and **social matching** for pets.

So we built **Goodle** — a Tinder-meets-Petfinder experience powered by AI. Upload a photo, and our Gemini AI tells you the breed, age, and personality in seconds. Swipe to match. Post to adopt. Pin on the map to reunite.

The name? **Good** + **Doodle** = **Goodle**. Because every pet deserves a good life. 🐕

---

## ✨ Features

| | Feature | What it does |
|---|---|---|
| 💘 | **Pet Matching** | Tinder-style swipe cards with real-time filters — distance, gender, personality |
| 🏠 | **Adoption Square** | Browse all adoptable pets with search, breed & age filters, rich detail pages |
| 📍 | **Lost & Found** | Map-based lost pet reports with red/blue markers for instant community alerts |
| 🤖 | **AI Photo Analysis** | Upload a pet photo → Gemini AI detects breed, age, size, traits in seconds |
| 🪄 | **Smart Profiles** | AI auto-fills your pet's profile — breed, color tags, personality description |
| 🔐 | **User Auth** | Email/password signup & login with JWT sessions, persistent across refreshes |
| 🎥 | **Video Moments** | Showcase your pet's personality with short video clips |

---

## 🛠 Tech Stack

<table>
<tr>
<td width="50%" valign="top">

### 🎨 Frontend
| | Tech |
|---|---|
| ⚛️ | **React 18** + **TypeScript** |
| ⚡ | **Vite** — lightning-fast builds |
| 🎨 | **Tailwind CSS** — utility-first styling |
| 🧭 | **React Router** (HashRouter) |
| 🎯 | **Lucide React** — beautiful icons |
| 🌐 | **Axios** — HTTP client |

</td>
<td width="50%" valign="top">

### ⚙️ Backend
| | Tech |
|---|---|
| 🐍 | **FastAPI** (Python 3.11) |
| 🐘 | **PostgreSQL 15** |
| 🤖 | **Google Gemini AI** |
| 🔑 | **python-jose** + **bcrypt** — JWT auth |
| 📋 | **Pydantic** — validation |
| 🔌 | **psycopg2** — Postgres adapter |

</td>
</tr>
</table>

### ☁️ Infrastructure
| | Service | Role |
|---|---|---|
| 🚀 | **Google Cloud Run** | Serverless backend hosting |
| 🗄️ | **Google Cloud SQL** | Managed PostgreSQL database |
| 📄 | **GitHub Pages** | Static frontend hosting |
| 🔄 | **GitHub Actions** | CI/CD — auto-deploy on push |
| 🐳 | **Docker** | Backend containerization |

---

## 🏗 Architecture

```
  ┌──────────────────┐         HTTPS          ┌──────────────────────┐
  │                  │ ──────── /api/* ──────▶ │                      │
  │  GitHub Pages    │                         │  Google Cloud Run    │
  │  (React SPA)     │ ◀────── JSON ────────  │  (FastAPI)           │
  │                  │                         │                      │
  └──────────────────┘                         └──────────┬───────────┘
                                                          │
                                               ┌──────────▼───────────┐
                                               │  Google Cloud SQL     │
                                               │  PostgreSQL 15        │
                                               └──────────┬───────────┘
                                                          │
                                               ┌──────────▼───────────┐
                                               │  Google Gemini AI     │
                                               │  Photo & Video        │
                                               │  Analysis              │
                                               └──────────────────────┘
```

---

## 📂 Project Structure

```
goodle/
├── 🐍 app/                     # Backend
│   ├── ai/                     #   Gemini AI clients
│   ├── api/                    #   Route handlers
│   ├── core/                   #   Auth, config, deps
│   ├── db/                     #   Database layer (SQLite / PostgreSQL)
│   ├── routes/                 #   Auth & pets endpoints
│   └── main.py                 #   FastAPI app entry
├── ⚛️ src/                      # Frontend
│   ├── api/                    #   Axios services
│   ├── assets/pets/            #   Pet images
│   ├── components/             #   Navbar, Footer
│   ├── context/                #   Auth context
│   ├── pages/                  #   All page components
│   ├── services/               #   Mock data
│   └── types/                  #   TypeScript types
├── 🔄 .github/workflows/       # CI/CD
├── 🐳 Dockerfile               # Backend container
├── ⚡ vite.config.ts            # Frontend build config
└── 📋 requirements.txt         # Python deps
```

---

## 🚀 Getting Started

### Prerequisites
> Node.js 20+ &bull; Python 3.11+ &bull; PostgreSQL *(optional — SQLite works locally)*

### Frontend
```bash
npm install
npm run dev          # → http://localhost:5173
```

### Backend
```bash
pip install -r requirements.txt -r requirements-backend.txt
uvicorn app.main:app --reload --port 8001
```

### 🔑 Environment Variables
| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Production only |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | For AI features |
| `AI_MOCK_MODE` | Set `1` to use mock AI responses | Dev only |

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
