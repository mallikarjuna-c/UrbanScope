# UrbanScope

**Urban health analysis powered by NASA Earth observation data.**

UrbanScope is a full-stack web application that helps city planners, researchers and citizens understand urban health. Search any city in the world, and UrbanScope assesses its heat risk, green space coverage and healthcare accessibility, projects how these indicators may change over the next five years, and visualises the results on NASA satellite imagery and interactive 3D maps.

---

## Features

### Analysis modules
| Module | What it does |
| --- | --- |
| **Urban Heat Risk Index** | Combines land surface temperature, population density and tree cover into a 0–10 risk index. Reports heat index, urban heat island (UHI) effect, vulnerable groups and cooling potential, with targeted recommendations. |
| **Green Space Analysis** | Scores vegetation (NDVI), green space coverage, distance to the nearest park and per-capita green space against WHO-style targets, and identifies coverage gaps. |
| **Healthcare Access** | Estimates the share of the population within a configurable drive time of a facility, facility/bed/doctor gaps, underserved zones and suggested locations for new facilities. |
| **5-Year Prediction** | Projects heat, green space and healthcare indicators forward, rates their impact and urgency, and generates intervention recommendations. |
| **Integrated Analysis** | Runs all three models together and produces an overall urban health score (0–100) with prioritised actions. |

### Visualisation
- **NASA satellite layers:** land surface temperature, NDVI and aerosol optical depth from NASA GIBS (MODIS), with a hexagonal heatmap overlay (Leaflet)
- **3D maps:** Google Maps satellite view with 45° tilt, worldwide location search and click-to-explore
- **Urban VR:** a gallery of immersive 3D videos covering heat islands, green spaces, air quality and smart-city planning
- **3D models:** interactive Earth and planet models built with React Three Fiber

### Also included
- Worldwide city search with autocomplete (OpenStreetMap Nominatim)
- AI assistant chatbot for urban health questions (Google Gemini)
- NASA Astronomy Picture of the Day
- Multi-language support via Google Translate
- Responsive layout for desktop and mobile

---

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite 5, React Router 6, React Three Fiber / Drei, Three.js, Leaflet, Bootstrap 5, Axios |
| Backend | Python 3.11, Flask 3, Flask-CORS, NumPy, pandas, Gunicorn |
| APIs & data | NASA POWER, NASA GIBS, NASA APOD, Google Maps JavaScript API, Google Gemini, OpenStreetMap Nominatim |

---

## Data sources

| Indicator | Source |
| --- | --- |
| Temperature (daily mean / max / min) | [NASA POWER](https://power.larc.nasa.gov/) API, with a latitude-based estimate as fallback |
| Satellite imagery (LST, NDVI, aerosols) | [NASA GIBS](https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs) (MODIS Terra) |
| Vegetation index used by the models | Location-based estimate |
| Population density | Reference values for major cities, estimate elsewhere |

> **Note:** The vegetation and population inputs to the analysis models are estimates rather than live satellite measurements, so repeated runs for the same location can vary slightly. Results are intended for exploration and demonstration, not for operational decisions.

The analysis methodologies are adapted from these open-source projects:
- Heat risk: [EsriDE/urban-heat-risk-index](https://github.com/EsriDE/urban-heat-risk-index)
- Green space: [GreenEx_Py](https://github.com/Spatial-Data-Science-and-GEO-AI-Lab/GreenEx_Py)
- Healthcare access: [health-care-analysis](https://github.com/radoslawkrolikowski/health-care-analysis)

---

## Project structure

```
UrbanScope/
├── backend/                  # Flask REST API
│   ├── app.py                # API routes
│   ├── models/               # Heat risk, green space, healthcare and prediction models
│   ├── utils/                # NASA data fetching helpers
│   └── requirements.txt
├── public/                   # 3D models (.glb), videos and static assets
├── src/
│   ├── components/           # Navbar, Footer, Chatbot, maps, 3D models, etc.
│   ├── pages/                # Home, HeatRisk, GreenSpace, Healthcare, UrbanVR, Maps3D, About
│   ├── utils/                # API client, geocoding, Google Maps loader
│   └── main.jsx              # Routes
├── .env.example              # Environment variable template
├── render.yaml               # Render deployment config (backend)
└── vercel.json               # Vercel deployment config (frontend)
```

---

## Getting started

### Prerequisites
- Node.js 18 or later
- Python 3.11 or later

### 1. Clone the repository
```bash
git clone https://github.com/mallikarjuna-c/UrbanScope.git
cd UrbanScope
```

### 2. Start the backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
python app.py
```
The API runs at `http://localhost:5000`.

### 3. Start the frontend
In a new terminal, from the project root:
```bash
npm install
cp .env.example .env           # then add your API keys
npm run dev
```
The app runs at `http://localhost:5173`.

---

## Environment variables

Create a `.env` file in the project root (see `.env.example`). It is git-ignored and must never be committed.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend base URL, e.g. `http://localhost:5000/api` |
| `VITE_GOOGLE_MAPS_API_KEY` | For 3D maps | Google Maps JavaScript API key (billing must be enabled) |
| `VITE_CHATBOT_API_KEY` | For chatbot | Google Gemini API key |
| `VITE_NASA_API_KEY` | Optional | NASA API key for APOD; defaults to `DEMO_KEY` |

The backend reads `NASA_API_KEY` from its environment (optional, defaults to `DEMO_KEY`).

---

## API reference

All endpoints are served under `/api`. Request bodies are JSON; `coordinates` is `[latitude, longitude]`.

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | – | Service health check |
| `POST` | `/heat-risk` | `{ city, coordinates, date? }` | Urban heat risk analysis |
| `POST` | `/green-space` | `{ city, coordinates, bufferDistance? }` | Green space exposure analysis |
| `POST` | `/healthcare-access` | `{ city, coordinates, population?, driveTimeThreshold? }` | Healthcare accessibility analysis |
| `POST` | `/integrated-analysis` | `{ city, coordinates }` | All three models plus an overall score |
| `POST` | `/predict-future` | `{ city, coordinates, years? }` | Future trend prediction (default 5 years) |

**Example**
```bash
curl -X POST http://localhost:5000/api/heat-risk \
  -H "Content-Type: application/json" \
  -d '{"city": "Bengaluru", "coordinates": [12.97, 77.59]}'
```

Successful responses return `{ "success": true, "data": { ... } }`. Invalid input returns HTTP `400` with `{ "success": false, "error": "..." }`.

---

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Author

**Mallikarjuna C** · [GitHub @mallikarjuna-c](https://github.com/mallikarjuna-c)

© 2026 UrbanScope. All rights reserved.
