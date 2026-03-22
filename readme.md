# SmartCareAI — Telemedicine Platform

A full-stack telemedicine platform with AI-powered medical report analysis.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + Tailwind CSS |
| Backend | Node.js + Express + MongoDB |
| AI Service | FastAPI + scikit-learn + pdfplumber |
| Storage | Cloudinary (or local uploads/) |

---

## Project Structure

```
SmartCareAI/
├── backend/          # Express REST API
├── aiservices/       # FastAPI ML prediction service
├── frontend/
│   └── SmartCareAI/ # Vite + React app
├── .gitignore
└── README.md
```

---

## Setup

### 1. Backend (Express)

```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartcare
JWT_SECRET=<run: openssl rand -hex 64>
FRONTEND_URL=http://localhost:5173
FASTAPI_URL=http://127.0.0.1:8000
DOCTOR_INVITE_CODE=<choose a secret code>

# Cloudinary (optional — remove to use local uploads/)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start:
```bash
npm run dev
```

---

### 2. AI Service (FastAPI)

```bash
cd aiservices
pip install -r requirements.txt
```

Create `aiservices/.env`:
```
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

Start:
```bash
uvicorn main:app --reload --port 8000
```

Check it's running: http://localhost:8000/health

---

### 3. Frontend (Vite + React)

```bash
cd frontend/SmartCareAI
npm install
```

Create `frontend/SmartCareAI/.env`:
```
VITE_API_URL=http://localhost:5000
```

Start:
```bash
npm run dev
```

App runs at: http://localhost:5173

---

## Roles

| Role | How to register | Access |
|---|---|---|
| Patient | Register normally | Upload reports, view own results |
| Doctor | Register with invite code | View all reports, mark completed |

Set `DOCTOR_INVITE_CODE` in `backend/.env` to any secret string. Share it only with doctors.

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register patient or doctor |
| POST | `/api/auth/login` | — | Login, returns JWT |

### Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/reports/upload` | Patient | Upload + analyze report |
| GET | `/api/reports/my` | Patient | View own reports |
| GET | `/api/reports/all` | Doctor | View all patient reports |
| PATCH | `/api/reports/:id/status` | Doctor | Update report status |

### AI Service
| Method | Endpoint | Description |
|---|---|---|
| POST | `/predict` | Analyze uploaded file |
| GET | `/health` | Service health + ML status |

---

## AI Prediction

The FastAPI service uses a **TF-IDF + Logistic Regression** model trained on medical text.

Supported conditions: Diabetes, Hypertension, Heart Disease Risk, Anemia, Thyroid Disorder, Kidney Disease, Infection, Gout, Normal.

Supported file types: PDF (text extracted via pdfplumber), TXT, PNG, JPEG.

If scikit-learn is unavailable, falls back to keyword-based rules automatically.

---

## Security Notes

- JWT tokens expire after 24 hours
- Auth routes are rate-limited (10 requests / 15 min / IP)
- File uploads limited to 5MB, allowed types only
- CORS restricted to frontend URL only
- Passwords hashed with bcrypt (salt rounds: 10)
- Never commit `.env` files or the `uploads/` folder