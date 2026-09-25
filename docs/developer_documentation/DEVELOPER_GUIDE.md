# EarthScape Climate Agency – Developer & Engineering Guide

## 1. System Components & Architecture
EarthScape is structured as a decoupled multi-service platform:
- **Backend Service (`backend/`)**: Node.js & Express.js REST API, Mongoose ORM, JWT security, MapReduce execution service, HDFS connector, and simulation streaming engine.
- **Frontend SPA (`frontend/`)**: React 18, Vite 5, Tailwind CSS, Recharts, Leaflet, jsPDF, and Context API.
- **Machine Learning Microservice (`ml/`)**: Python 3.12 FastAPI service executing Scikit-Learn polynomial regressors, Isolation Forest, and Pearson/Spearman correlation engines.
- **Hadoop Big Data Engine (`hadoop/`)**: Python mapper and reducer jobs for standard Hadoop Streaming on Apache Hadoop clusters.
- **Data Partitions (`data/`)**: Partitioned raw, processed, and synthetic climate data archives.

---

## 2. Environment Variables Specification

Create `.env` in `backend/` and project root:
```env
PORT=5000
BACKEND_PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/earthscape
JWT_SECRET=earthscape_super_secret_jwt_key_2026
HDFS_ENABLED=false
HDFS_NAMENODE_URL=http://localhost:9870/webhdfs/v1
ML_SERVICE_URL=http://127.0.0.1:8000
NODE_ENV=development
```

---

## 3. Database Schemas (Mongoose)

### 3.1 User Schema
- `name`: String, required
- `email`: String, unique, lowercase
- `passwordHash`: String, bcrypt salt 10
- `role`: Enum `['ADMIN', 'ANALYST']`
- `status`: Enum `['ACTIVE', 'INACTIVE', 'SUSPENDED']`
- `lastLogin`: Date

### 3.2 Climate Record Schema
- `date`: String (YYYY-MM-DD), indexed
- `location`: String, indexed
- `latitude`: Number
- `longitude`: Number
- `temperature`: Number (°C)
- `humidity`: Number (%)
- `rainfall`: Number (mm)
- `windSpeed`: Number (km/h)
- `airPressure`: Number (hPa)
- `co2`: Number (ppm)
- `source`: String
- `isSimulated`: Boolean

### 3.3 Anomaly Schema
- `date`: String
- `location`: String
- `parameter`: String
- `observedValue`: Number
- `expectedRange`: String
- `severity`: Enum `['Low', 'Medium', 'High', 'Critical']`
- `method`: Enum `['Z-score', 'IQR', 'Isolation Forest', 'Threshold MapReduce']`
- `status`: Enum `['Detected', 'Investigating', 'Resolved', 'Dismissed']`

---

## 4. REST API Endpoints Specification

### Authentication & Users
- `POST /api/auth/login`: Authenticate and receive JWT
- `POST /api/auth/register`: Register new account
- `GET /api/auth/profile`: Get logged in user
- `GET /api/users`: List users (Admin)
- `POST /api/users`: Create user (Admin)
- `PUT /api/users/:id`: Update user role/status (Admin)
- `DELETE /api/users/:id`: Delete user (Admin)

### Datasets & Ingestion
- `POST /api/datasets/upload`: Multipart upload with validation and HDFS sync
- `GET /api/datasets`: List dataset archives
- `DELETE /api/datasets/:id`: Delete dataset (Admin)

### Climate Data & Export
- `GET /api/climate`: Paginated, multi-filter climate records
- `GET /api/climate/statistics`: Aggregated averages, min/max, trends
- `GET /api/climate/locations`: Station summaries and GIS coordinates
- `GET /api/climate/export-csv`: Stream CSV for Tableau

### Big Data & MapReduce
- `POST /api/analytics/process`: Submit MapReduce job
- `GET /api/analytics/jobs`: List past jobs
- `GET /api/analytics/jobs/:jobId`: Poll job progress & logs
- `GET /api/hdfs/status`: HDFS connection status
- `POST /api/hdfs/mode`: Toggle HDFS vs Local mode (Admin)

### Machine Learning
- `POST /api/ml/predict`: Polynomial time-series trend projections
- `POST /api/ml/detect-anomalies`: Multi-model anomaly scan
- `GET /api/ml/correlations`: Pearson/Spearman matrix
- `GET /api/anomalies`: List flagged anomalies
- `PUT /api/anomalies/:id`: Update anomaly status

### Live Simulation & Alerts
- `POST /api/simulation/start`: Start SSE broadcast (Admin)
- `POST /api/simulation/stop`: Stop stream (Admin)
- `GET /api/simulation/stream`: Server-Sent Events stream
- `GET /api/alerts`: List alerts
- `PUT /api/alerts/:id`: Update alert status
- `GET /api/alerts/settings`: Threshold settings
- `PUT /api/alerts/settings`: Update thresholds (Admin)

### Reports, Support & Logs
- `GET /api/reports/comprehensive`: Multi-variable summary for PDF
- `POST /api/support`: Submit support ticket
- `GET /api/support`: List tickets
- `PUT /api/support/:id`: Respond to ticket (Admin)
- `GET /api/logs`: Audit activity log (Admin)