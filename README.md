# Sol / சொல் - Zero-UI Voice Assistant PWA

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Pytest](https://img.shields.io/badge/Pytest-8+-0A9EDC.svg?logo=pytest&logoColor=white)](https://pytest.org)
[![Repository Size](https://img.shields.io/badge/Repo%20Size-%3C10MB-brightgreen)](#zero-bloat-guarantee)

> **"சொல்" (Sol)** means *"Speak / Word"* in Tamil.  
> A voice-first, **Zero-UI Progressive Web App (PWA)** built under a strict **10MB repository limit** to empower rural Indian women with zero digital literacy to independently access the **Kalaignar Magalir Urimai Thittam** (₹1,000 monthly financial assistance scheme) purely through conversational voice.

---

## 🌟 Key Innovations & Zero-UI Design

- **Voice-First Zero-UI:** No complex forms, text inputs, or navigation menus. A single **massive, high-contrast microphone button** dominates the center of the viewport.
- **Pure Conversational Tamil:** AI speaks exclusively in simple, conversational Tamil (*எளிய பேச்சுத் தமிழ்*), asking only one eligibility question at a time in max 2 sentences.
- **Mandated First Interaction:** Initiates with:
  > *"வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?"*
- **Acoustic Earcons & Haptic Feedback:** Generates chimes dynamically via native Web Audio API oscillators and physical vibrations via `navigator.vibrate`—**ZERO audio/media asset bloat**.
- **Full a11y Compliance:** Semantic HTML (`<main>`, `<header>`, `<footer>`), `role="button"`, dynamic Tamil/English `aria-labels`, `aria-pressed`, `aria-live="assertive"`, and keyboard navigation (`Enter` / `Space`).
- **PWA Ready:** Installable with offline shell caching via custom service worker and pure vector SVG branding.

---

## 📁 Repository Structure

```
Sol/
├── .env.example              # Template for API keys & configuration
├── .gitignore                # Strict zero-bloat ignore rules (<10MB)
├── README.md                 # Complete documentation & usage guide
├── requirements.txt          # Python backend dependencies
├── config.py                 # Pydantic & environment settings
├── main.py                   # FastAPI app entry with CORS & routes
├── backend/                  # Modular backend package
│   ├── __init__.py
│   └── main.py
├── api/                      # Modular API routing & validation
│   ├── __init__.py
│   ├── routes.py             # /health, /welcome, /chat endpoints
│   └── schemas.py            # Pydantic request/response schemas
├── services/                 # AI Reasoning Engine
│   ├── __init__.py
│   └── gemini_service.py     # Official google-genai SDK integration
├── tests/                    # Unit testing suite
│   ├── __init__.py
│   └── test_api.py           # PyTest test cases (Health, Welcome, Chat, CORS)
├── package.json              # Frontend dependencies & scripts
├── vite.config.js            # Vite configuration with FastAPI proxy
├── tailwind.config.js        # High-contrast color palette & animations
├── postcss.config.js         # PostCSS configuration
├── index.html                # Semantic HTML5 entry with Tamil typography
├── public/                   # Pure text/vector web assets
│   ├── manifest.json         # PWA Manifest
│   ├── sw.js                 # Service worker for offline shell
│   └── icon.svg              # Pure vector SVG logo
└── src/                      # React Frontend Source
    ├── App.jsx               # Zero-UI coordinator component
    ├── main.jsx              # React DOM mounting & SW registration
    ├── index.css             # Tailwind base & CSS wave animations
    ├── hooks/
    │   └── useSpeech.js      # Native Web Speech API integration
    ├── components/
    │   ├── Header.jsx        # Prominent "Sol / சொல்" branding
    │   ├── MicButton.jsx     # Massive central high-contrast microphone button
    │   ├── TranscriptView.jsx# Clear Tamil text display & replay button
    │   └── HelpBanner.jsx    # 3-step voice guidance for low-literacy users
    └── utils/
        └── audioCue.js       # Web Audio API synthetic earcons & haptics
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup (FastAPI & Gemini)

```bash
# 1. Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY

# 4. Start the FastAPI backend server
uvicorn main:app --reload --port 8000
```

The backend will be available at:
- **API Base:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`

---

### 2. Frontend Setup (React Vite PWA)

```bash
# 1. Install frontend dependencies
npm install

# 2. Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser (preferably Google Chrome or Edge for full Web Speech API support).

---

## 🧪 Automated Testing with PyTest

Run the unit test suite:

```bash
pytest tests/
```

**Unit Tests Covered:**
1. `test_health_check_endpoint`: Validates `GET /api/health` and `GET /health` return 200 OK and valid health metadata.
2. `test_welcome_message_endpoint`: Asserts `GET /api/welcome` outputs the mandated Tamil opening greeting:
   *"வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?"*.
3. `test_chat_interaction_dialogue`: Verifies multi-turn speech reasoning dialogue and response schema.
4. `test_cors_headers_configured`: Tests CORS preflight headers allowing PWA browser origin requests.

---

## 🏛️ Scheme Reasoning (Kalaignar Magalir Urimai Thittam)

Sol guides women step-by-step through the Tamil Nadu government eligibility criteria:
1. **Age:** Woman applicant aged 21 years or older.
2. **Annual Income:** Below ₹2.5 Lakhs.
3. **Electricity Consumption:** Under 3,600 units annually.
4. **Land Ownership:** Under 5 acres wetland or 10 acres dryland.
5. **Ration Card:** Designated female head on the family ration card (*குடும்ப அட்டை*).

---

## 🔒 Security & Zero-Bloat Guarantee

- **Zero Hardcoded Secrets:** Loaded exclusively via environment variables (`GEMINI_API_KEY`).
- **Zero Media Bloat:** Zero binary image, audio, or video files committed. The entire repository is purely code and lightweight SVG vectors, well under the **10MB constraint**.
- **Offline Resilient:** Operates seamlessly even when offline with fallback speech synthesis and cached PWA shell.
