# EARTHSCAPE CLIMATE AGENCY
## Big Data Climate Monitoring, Analysis & Prediction System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend: React Vite](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-cyan.svg)](frontend/)
[![Backend: Node Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green.svg)](backend/)
[![Big Data: Hadoop MapReduce](https://img.shields.io/badge/Big%20Data-Hadoop%20%7C%20HDFS%20%7C%20MapReduce-purple.svg)](hadoop/)
[![ML: Python Scikit-Learn](https://img.shields.io/badge/ML-Python%20%7C%20Scikit--Learn%20%7C%20FastAPI-emerald.svg)](ml/)

---

## 1. Project Overview
**EarthScape** is a professional, full-stack, enterprise-grade web-based **Climate Monitoring, Big Data Analytics and Prediction System** designed for environmental protection and meteorological agencies.

The platform continuously ingests, validates, cleans, and stages high-volume climate observations from weather station networks, satellite telemetry, and IoT sensors into **Hadoop Distributed File System (HDFS)**. It executes distributed **MapReduce** batch processing jobs, deploys **Machine Learning** algorithms for future climate trend projection and anomaly detection, broadcasts simulated **real-time telemetry streams**, manages automated **threshold alerts**, and provides interactive dashboards, GIS maps, and **Tableau-ready exports**.

---

## 2. Complete Workflow Architecture

```text
Climate Data Sources (Weather Stations, Satellites, Environmental Sensors, Live Telemetry)
                                    ↓
                              Data Ingestion
                                    ↓
                        Data Validation & Cleaning
                                    ↓
                        HDFS Storage / Partitions
                                    ↓
                      Hadoop / MapReduce Processing
                                    ↓
                           Climate Analytics
                                    ↓
                   Machine Learning Microservice (Python)
                                    ↓
                     Predictions & Anomaly Detection
                                    ↓
                        Dashboard & Visualizations
                                    ↓
                          Alerts & Notifications
                                    ↓
                        Executive Reports & Tableau
```

---

## 3. Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Recharts, Leaflet, React-Leaflet, Lucide Icons, jsPDF, jsPDF-AutoTable.
- **Backend API**: Node.js, Express.js, Mongoose ORM, MongoDB (with automatic zero-download development fallback), JWT, Bcrypt.js, Multer, Fast-CSV.
- **Big Data & Distributed Computing**: Apache Hadoop, HDFS distributed file hierarchy, Hadoop Streaming Python Mappers and Reducers, and dual-mode execution engine (`HDFS MODE` vs `LOCAL DEV MODE`).
- **Machine Learning Microservice**: Python 3.12, FastAPI, Uvicorn, Scikit-Learn (Polynomial Ridge Regressors, Isolation Forest, Z-Score, IQR), Pandas, NumPy.
- **Visualizations & BI Integration**: Interactive Recharts, Leaflet Geographic Station Map, and Tableau CSV data stream.

---

## 4. Default Demonstration Credentials

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@earthscape.org` | `Admin@123456` | Full platform control, User management, Thresholds, Audit logs, Stream control |
| **Climate Analyst** | `analyst@earthscape.org` | `Analyst@123456` | Analytical workbench, MapReduce, ML predictions, Anomalies, Reporting, Support |

*(The login screen also features quick 1-click demo login buttons for both Admin and Analyst portals)*

---

## 5. Quick Start Installation Guide

### Prerequisites
- Node.js (v18+) and npm
- Python (3.10+)

### Step 1: Install Backend & Frontend Dependencies
```bash
# From the root directory:
npm install --prefix backend
npm install --prefix frontend
```

### Step 2: Setup Python Machine Learning Virtual Environment
```bash
python -m venv ml/venv
# Windows:
ml\venv\Scripts\pip install -r ml/requirements.txt
# Linux/macOS:
ml/venv/bin/pip install -r ml/requirements.txt
```

### Step 3: Configure Environment
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```

### Step 4: Launch All Services

**Terminal 1 — Python ML Service:**
```bash
# Windows:
ml\venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8000 --app-dir ml
# Linux/macOS:
ml/venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8000 --app-dir ml
```

**Terminal 2 — Backend API Server:**
```bash
cd backend
npm start
```

**Terminal 3 — Frontend UI:**
```bash
cd frontend
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 6. Core Modules & Features

1. **Authentication & RBAC**: Secure JWT authentication, bcrypt password hashing, role enforcement (`ADMIN` vs `ANALYST`), account lifecycle management.
2. **Admin & Analyst Dashboards**: High-level KPIs, temperature & CO2 trends, precipitation vs humidity waveforms, anomaly location distributions, and source breakdown pie charts.
3. **Data Ingestion & Validation**: Multi-format ingestion (.csv / .json), strict schema validation, missing/null value handling, type casting, HDFS sync, and dataset metadata catalog.
4. **Hadoop MapReduce & HDFS**: Python Mapper and Reducer jobs for temperature extremes, monthly precipitation, carbon matrices, and threshold anomaly scanning. Features a real-time terminal log viewer and visual `HDFS MODE` vs `LOCAL DEV MODE` switcher.
5. **Machine Learning Predictions**: Polynomial Ridge Regression for 6-months to 5-years future climate projections with $R^2$, $RMSE$ metrics and 95% confidence intervals.
6. **Multi-Model Anomaly Detection**: Statistical Z-score ($\sigma > 2.5$), Interquartile Range (IQR $1.5\times$), and ML Isolation Forest unsupervised clustering with severity classification (*Low*, *Medium*, *High*, *Critical*).
7. **Real-Time Telemetry Simulator**: Simulated live telemetry streaming across 8 major weather stations via Server-Sent Events (SSE) with live waveforms and auto-scrolling telemetry packets.
8. **Automated Alerting Engine**: Multi-variable threshold breach detection (Temp > 45°C, Rain > 100mm, Humidity > 90%, CO2 > 450ppm, Wind > 80km/h) with configurable limits and incident resolution workflow.
9. **GIS Location Map**: Interactive Leaflet map displaying weather stations with color-coded status markers and telemetry popups.
10. **Reports & Tableau Integration**: Executive PDF report generator (built with jsPDF) and Tableau/PowerBI-ready CSV export stream.
11. **Helpdesk & Audit Logs**: Multi-priority support ticket manager with admin responses, and full security activity audit logs.

---

## 7. Sample Datasets
Located in `data/sample/`:
- `normal_data.csv`: 2,920 records of multi-station climate time-series.
- `anomaly_data.csv`: Injected with severe heatwave, flash flood, and hazardous carbon outlier events for testing.

---

## 8. License
Developed for EarthScape Climate Agency. Licensed under the MIT License.