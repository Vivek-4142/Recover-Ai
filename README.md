# Recover-Ai 🏥🩺

**Recover-Ai** is an advanced, production-grade recovery tracking companion and clinical triage application designed to bridge the gap between patient rehabilitation and physician monitoring. By combining daily patient telemetry check-ins with an intelligent, self-contained Random Forest regression model, the system calculates recovery progress indices and dynamically flags high-risk clinical events for physicians in real-time.

---

## 🔗 Live Deployments

* **Frontend Client Portal:** [https://recover-ai-rho.vercel.app/](https://recover-ai-rho.vercel.app/)
* **Backend API Gateway:** [https://recover-ai-2.onrender.com/](https://recover-ai-2.onrender.com/)
* **Database Layer:** Hosted securely on PostgreSQL via **Neon.tech**

---

## 🏗️ System Architecture

GitHub renders the diagram below natively as an interactive flowchart:

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

## ✨ Features

* **🛡️ Hardened Security:** Implements secure `bcrypt` salted password hashing on registration/login alongside JSON Web Token (JWT) authorization headers to secure all patient clinical endpoints.
* **🧠 Machine Learning Engine:** Integrated self-contained Random Forest Regressor predicting patient recovery velocity scores based on pain levels, medication compliance, energy rates, and qualitative check-in symptom parameters.
* **⏰ Automated Reminders:** Background cron schedules executing every 5 minutes (via `APScheduler`) to scan compliance databases and automatically send custom SMTP warning emails to patients missing medications or daily check-in deadlines.
* **🩺 Dual-Portal Dashboards:**
  * **Physician Triage Dashboard:** Real-time patient tracking table displaying patient profiles, averages, and automated **Normal / Elevated / High Alert** status flags.
  * **Patient Client Dashboard:** Log logs daily, view personalized recovery charts, and converse with the **AI Diagnostic Assistant** built on telemetry logic.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, Vite, Tailwind CSS, Axios, React Router 7.
* **Backend:** FastAPI, SQLAlchemy, Uvicorn, APScheduler.
* **Database:** PostgreSQL (Production), SQLite (Local Dev).
* **ML Core:** Scikit-learn, Pandas, Joblib.

---

## 🚀 Cloning & Local Development Setup

Follow these steps to clone, configure, and run the entire stack on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Vivek-4142/Recover-Ai.git
cd Recover-Ai
```

### 2. Configure and Run the Backend
1. Navigate to the `backend` folder and duplicate `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Open the `backend/.env` file and customize your settings. *Note: If `DATABASE_URL` is omitted, it will automatically fall back to a local SQLite database (`recover_ai.db`) for offline ease!*
   ```ini
   # For live testing (optional):
   DATABASE_URL=postgresql://neondb_owner:npg_XZDr70OMPdSC@ep-floral-butterfly-aqijug8p.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   # JWT Key
   JWT_SECRET=super_secret_jwt_key_change_me_in_production
   
   # SMTP Settings (optional for emails)
   MAIL_USERNAME=your_gmail@gmail.com
   MAIL_PASSWORD=your_google_app_password
   ```
3. Install dependencies and start the local FastAPI web server:
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
   > [!NOTE]
   > On initial start, the server will auto-generate all SQL schemas and automatically seed pre-filled test data with secure, hashed credentials.

### 3. Configure and Run the Frontend
1. Open a new terminal window, navigate to the `frontend/Recover-Ai` folder, and copy `.env.example` to `.env`:
   ```bash
   cd frontend/Recover-Ai
   cp .env.example .env
   ```
2. Configure your local API address inside `frontend/Recover-Ai/.env`:
   ```ini
   VITE_API_BASE_URL=http://localhost:8000
   ```
3. Install dependencies and launch the Vite development server:
   ```bash
   npm install
   npm run dev
   ```

---

## 🔑 Seeded Test Accounts

To test the application locally or live in production, you can log in using these preloaded credentials:

| Portal Access | Role | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Clinical Staff Portal** | Doctor | `doctor.jenkins@recoverai.com` | `password123` |
| **Patient Access Portal** | Patient | `vivek@patient.com` | `password123` |
| **Patient Access Portal** | Patient | `samantha@patient.com` | `password123` |

---

## ⚙️ Production Deployment Checklist

### Vercel (Frontend SPA)
1. Import your `Recover-Ai` repository into Vercel.
2. Set the **Root Directory** to `frontend/Recover-Ai`.
3. Add the Environment Variable: `VITE_API_BASE_URL` = `https://recover-ai-2.onrender.com` (no trailing slash).
4. Click **Deploy**. *URL routing rewrites are already handled automatically by [vercel.json](file:///c:/Users/Vivek/OneDrive/Desktop/projects/recover-ai/frontend/Recover-Ai/vercel.json).*

### Render (FastAPI Web Service)
1. Import your repository into Render and create a **Web Service**.
2. Set the **Root Directory** to `backend`.
3. Set the build and startup scripts:
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, configure your production keys:
   * `DATABASE_URL` (Neon Cloud Connection String)
   * `JWT_SECRET` (Secure Random Hash)
   * `MAIL_USERNAME` & `MAIL_PASSWORD` (SMTP credentials)
5. Click **Deploy**.