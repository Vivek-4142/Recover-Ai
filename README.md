# Recover-Ai 🏥🩺
> **An Intelligent, Secure Clinical Recovery Companion Bridging Patient Rehab and Physician Triage.**

---

## 1. Title + Tagline
# Recover-Ai
### *Intelligent Post-Discharge Telemetry, Automated Warning Schedulers, and Secure ML-Driven Clinical Triage.*

---

## 2. Demo Image / GIF
![Recover-Ai Platform Overview](screenshots/Screenshot%202026-06-02%20121933.png)

---

## 3. Live Demo Links
* **🖥️ Live Patient & Clinician Portal:** [https://recover-ai-rho.vercel.app/](https://recover-ai-rho.vercel.app/)
* **⚡ Live Backend API Gateway:** [https://recover-ai-2.onrender.com/](https://recover-ai-2.onrender.com/)
* **🗄️ Cloud Database Cluster:** PostgreSQL hosted persistently on **Neon.tech**

---

## 4. Problem Statement
Post-discharge patient recovery is historically a **clinical black box**. Once a patient leaves the hospital, physicians lose real-time visibility into their recovery trajectory. 

This disconnect leads to several major industry issues:
* **Delayed Interventions:** Critical recovery anomalies (like sudden spike in pain or severe swelling) are only detected during bi-weekly follow-ups, leading to avoidable readmissions.
* **Low Medication Adherence:** Patients struggle to strictly follow pain prevention medication times, leading to severe neural pain cycles.
* **Unsecured Patient Telemetry:** Prototype healthcare platforms often store sensitive patient details and credentials in **plaintext**, violating basic privacy standards.
* **Data Silos:** Manual check-ins and recovery notes fail to compile into actionable medical summaries for supervising clinicians.

---

## 5. Solution
**Recover-Ai** solves this by establishing a secure, automated, and intelligent loop between the patient's home recovery and the doctor's workstation:

* **Secure Telemetry pipeline:** Restricts all endpoints using cryptographically secure `bcrypt` salted hashes for user logins and signed JSON Web Tokens (JWT) for all API requests.
* **Intelligent Risk Prediction:** Integrates a self-contained Random Forest Regression model that calculates healing velocity indexes and maps them to **Normal**, **Elevated**, or **High Alert** statuses.
* **Proactive Warning Engine:** Runs an automated background job scheduler (`APScheduler`) checking medication times and daily check-in deadlines, sending SMTP warning emails to patients instantly.
* **Clinician Triage Desk:** Compiles and visualizes all historical telemetry indexes into a real-time, prioritizeable medical tracking board.

---

## 6. Features

* **🛡️ Hardened Auth Security:** Passwords are hashed and salted with `bcrypt` on registration. Sessions are authorized via JSON Web Tokens (JWT) attached to headers by an automated Axios request interceptor.
* **🧠 ML Healing Prognosis:** Native machine learning model taking active patient pain, compliance, and text symptoms to return an objective 0-100 healing velocity score.
* **⏰ Cron Scheduler Alerts:** Background job cron cycles executing every 5 minutes to audit patient compliance and alert patients who miss dosage slots or daily check-ins.
* **🤖 AI Diagnostics Assistant:** A natural language client-side assistant that reads live database metrics to answer patient questions on pain trends, recovery compliance, and specialist advice.
* **📊 Multi-User Portals:**
  * **Doctor Dashboard:** Live medical sorting board classifying patient pain trends, healing scores, and risk flags.
  * **Patient Portal:** Visual recovery charts, medicine logging sliders, and symptom submission dashboards.

---

## 7. Screenshots

### 🖥️ Clinical Dashboard & Patient Portals
Below is a visual layout of the live Recover-Ai platform in action:

| **1. Physician Triage Board** | **2. Secure Portal Login** |
| :---: | :---: |
| ![Physician Dashboard](screenshots/Screenshot%202026-06-02%20121933.png) | ![Portal Login](screenshots/Screenshot%202026-06-02%20122314.png) |

| **3. Patient Interactive Logging** | **4. AI Diagnostic Assistant** |
| :---: | :---: |
| ![Patient Check-In](screenshots/Screenshot%202026-06-02%20122403.png) | ![AI Companion Chat](screenshots/Screenshot%202026-06-02%20122422.png) |

| **5. Detailed Clinical Charts** | **6. Historical Triage Telemetry** |
| :---: | :---: |
| ![Clinical Charts](screenshots/Screenshot%202026-06-02%20122150.png) | ![Telemetry History](screenshots/Screenshot%202026-06-02%20122209.png) |

---

## 8. Architecture Diagram

The flowchart below represents the live production system architecture, rendered natively by GitHub:

```mermaid
graph TD
    classDef client fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;
    classDef server fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff;
    classDef database fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;
    classDef service fill:#f43f5e,stroke:#e11d48,stroke-width:2px,color:#fff;
    
    C1[React Frontend SPA <br> Vite + Vercel CDN]:::client
    C2[Doctor / Patient Clients]:::client
    
    subgraph FastAPI Backend [Render Container Instance]
        B1[FastAPI Server Gateway]:::server
        B2[APScheduler Background Jobs]:::server
        B3[Bcrypt & JWT Auth Core]:::server
        B4[Random Forest Inference Pipeline]:::server
    end
    
    D1[(Neon PostgreSQL Cloud DB)]:::database
    S1[Google SMTP Gateway]:::service
    
    C2 -->|HTTPS Requests| C1
    C1 -->|Secure API Requests <br> Authorization: Bearer JWT| B1
    B1 -->|SQL Reads / Writes| D1
    B1 -->|Hash & Verify Tokens| B3
    B1 -->|Load Pipeline & Inference| B4
    B2 -->|Trigger Reminders| B1
    B1 -->|Send Reminder Emails| S1
```

---

## 9. ML Pipeline

The prediction core runs an advanced scikit-learn preprocessing and regression pipeline:

* **Dataset:** Evaluates key telemetry markers: `pain_level` (numerical), `medication_taken` (binary), `energy_level` (categorical), and `symptoms` (raw text).
* **Preprocessing:**
  * **Text symptoms:** Vectorized into token relationships using a `TfidfVectorizer`.
  * **Energy categories:** Categorized into sparse arrays using a `OneHotEncoder`.
  * **Remainder columns:** Passed through using a column transformer pipeline.
* **Model:** A `RandomForestRegressor` trained on historical patient progress to output a continuous recovery progress score from **0** (critical/stagnant) to **100** (fully rehabilitated).
* **Self-Contained Pipeline:** The entire preprocessing transformer and trained Random Forest model are dumped into a single binary pipeline file `recovery_pipeline.pkl`. During API calls, this pipeline is loaded into memory via `joblib` inside `predict.py` to calculate inference live:
  ```python
  pipeline = joblib.load("models/recovery_pipeline.pkl")
  score = pipeline.predict(input_df)[0]
  ```

---

## 10. Tech Stack

* **Frontend Framework:** React 19 (JavaScript), Vite bundler.
* **Styling & Icons:** Vanilla CSS (curated harmonized color palettes, dark glassmorphism), Tailwind CSS, Custom SVG vectors.
* **HTTP Client:** Axios (equipped with secure JWT Request Interceptors).
* **Backend API Framework:** FastAPI (Python), Uvicorn ASGI server.
* **Database & ORM:** PostgreSQL (Production Neon Cluster), SQLAlchemy ORM core.
* **Background Scheduler:** APScheduler (Interval & Cron triggers).
* **Machine Learning:** Scikit-learn, Pandas, Joblib.

---

## 11. Project Structure

```text
Recover-Ai/
├── backend/
│   ├── database/
│   │   ├── database.py       # SQLAlchemy engine & session configurations
│   │   ├── init_db.py        # Generates production tables on startup
│   │   ├── models.py         # SQLAlchemy SQL schema schemas
│   │   └── seed.py           # Seeds database with secure bcrypt-hashed profiles
│   ├── models/
│   │   └── recovery_pipeline.pkl  # Self-contained ML Random Forest pipeline
│   ├── routes/
│   │   ├── auth.py           # Bcrypt signup, login, and JWT issuing
│   │   ├── checkin.py        # Log logs and history data retrievals
│   │   ├── patient.py        # Clinician patient chart list retrievals
│   │   └── preditcion.py     # Live ML recovery score endpoint
│   ├── services/
│   │   ├── auth_service.py   # JWT signing, cryptography hashing, route security
│   │   ├── email_service.py  # SMTP secure environment email dispatcher
│   │   ├── predict.py        # Pandas input parser and joblib pipeline loader
│   │   ├── remainder_service.py # Cron medication & check-in checker logic
│   │   └── scheduler.py      # Background APScheduler interval settings
│   ├── main.py               # FastAPI entrypoint, CORS, and dotenv loader
│   ├── requirements.txt      # Python production dependencies list
│   └── .env.example          # Environment variables template
├── frontend/
│   └── Recover-Ai/
│       ├── src/
│       │   ├── components/   # Custom Layouts, navigation, and SVGs
│       │   ├── doctor/       # Clinician dashboards & clinical analytics views
│       │   ├── pages/        # Public Homepages, logins, and registrations
│       │   ├── patient/      # Patient charts, logs, and AI Assistant
│       │   └── services/
│       │       └── api.jsx   # Dynamic Axios settings with automated JWT injection
│       ├── package.json      # Frontend package configuration (Vite, Axios, Router)
│       └── vercel.json       # Vercel URL rewrite rules for SPA router support
└── README.md                 # Complete system documentation
```

---

## 12. Installation & Running Locally

### Prerequisites
* **Python 3.11+** installed.
* **Node.js 18+** installed.

### 1. Clone the Codebase
```bash
git clone https://github.com/Vivek-4142/Recover-Ai.git
cd Recover-Ai
```

### 2. Run the Backend Service
1. Navigate to the `backend` folder and duplicate `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Populate the `.env` file with your credentials. *If `DATABASE_URL` is omitted, the app will automatically fall back to local SQLite (`recover_ai.db`) for easy offline testing!*
   ```ini
   DATABASE_URL=postgresql://neondb_owner:npg_XZDr70OMPdSC@ep-floral-butterfly-aqijug8p.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=super_secret_jwt_key_change_me_in_production
   ```
3. Install the dependencies and start the uvicorn development server:
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

### 3. Run the Frontend Client
1. Navigate to `frontend/Recover-Ai` and duplicate `.env.example` to `.env`:
   ```bash
   cd ../frontend/Recover-Ai
   cp .env.example .env
   ```
2. Configure the API base path:
   ```ini
   VITE_API_BASE_URL=http://localhost:8000
   ```
3. Install node packages and start the Vite server:
   ```bash
   npm install
   npm run dev
   ```

---

## 13. API Documentation

All clinical and inference API endpoints require a valid secure token inside the headers: `Authorization: Bearer <JWT_TOKEN>`.

### Authentication Endpoints
* **`POST /auth/register/doctor`**
  * Registers a new doctor.
  * **Payload:** `{ "name": "Dr. Smith", "email": "smith@gmail.com", "password": "securepassword" }`
* **`POST /auth/register/patient`**
  * Registers a new patient under a doctor.
  * **Payload:** `{ "name": "John Doe", "email": "john@patient.com", "password": "...", "age": 30, "condition": "Post-op Rehab", "recovery_start_date": "2026-06-01", "doctor_id": 1 }`
* **`POST /auth/login`**
  * Verifies hashed credentials and issues a signed JWT access token.
  * **Payload:** `{ "email": "john@patient.com", "password": "..." }`
  * **Response:** `{ "role": "patient", "id": 1, "access_token": "eyJhbGciOi..." }`

### Clinical telemetry Endpoints
* **`GET /patients`** *(Requires Authorization Token)*
  * Retrieves all patient files assigned to the supervising doctor.
* **`GET /patients/{id}`** *(Requires Authorization Token)*
  * Retrieves detailed clinical telemetry charts for an individual patient.
* **`POST /checkins`** *(Requires Authorization Token)*
  * Logs daily telemetry metrics for a patient.
  * **Payload:** `{ "patient_id": 1, "pain_level": 4, "symptoms": "Mild stiffness", "medication_taken": true, "energy_level": "medium" }`
* **`GET /checkins/{patient_id}`** *(Requires Authorization Token)*
  * Retrieves historical log logs for patient charts.

### Machine Learning Endpoints
* **`POST /predict-recovery`** *(Requires Authorization Token)*
  * Passes patient telemetry directly to the Random Forest model and returns risk scores.
  * **Payload:** `{ "pain_level": 4, "symptoms": "Stiffness", "medication_taken": true, "energy_level": "medium" }`
  * **Response:** `{ "recovery_score": 78.5, "risk": "LOW" }`

---

## 14. Future Scope

* **🏥 HL7/FHIR Compliance Interoperability:** Integrating data schemas directly with industry standards to allow seamless syncing with real hospital EHR systems (like Epic or Cerner).
* **🤖 Conversational LLM Diagnostics:** Upgrading the rules-based Assistant to a fully generative LLM (using Gemini API) for deeper, conversational patient support.
* **⌚ Wearable Integrations:** Connecting Apple HealthKit and Google Fit APIs to import passive patient data (heart rate, step sets, sleep quality) for more precise ML prognostic runs.
* **📱 Native Mobile Ports:** Porting React components to React Native for high-performance iOS and Android mobile app installations.

---

## 15. Contributors
* **Vivek Kumar** — Lead System Architect & Full-Stack Developer
  * GitHub: [@Vivek-4142](https://github.com/Vivek-4142)

---
*Developed under production standards for Recover-Ai. 🏥🩺*