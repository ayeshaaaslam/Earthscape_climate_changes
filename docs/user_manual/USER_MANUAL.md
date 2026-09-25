# EarthScape Climate Agency – Comprehensive User Manual

## 1. Introduction
**EarthScape** is an enterprise-grade web-based climate monitoring, big data processing, and predictive analytics platform. It facilitates multi-station climate monitoring, Hadoop MapReduce distributed computations, machine learning projections, simulated live telemetry streams, automated alerts, and Tableau-ready reporting.

---

## 2. User Roles & Access Privileges

| Feature / Capability | Administrator | Climate Analyst |
| :--- | :---: | :---: |
| **System Operations Dashboard** | Full Access | Analyst View |
| **Dataset Ingestion (.csv, .json)** | Full Access | Full Access |
| **Hadoop MapReduce Execution** | Full Access | Full Access |
| **HDFS / Local Mode Switching** | Full Access | Read-Only Badge |
| **Machine Learning Trend Projections**| Full Access | Full Access |
| **Anomaly Detection Scanner** | Full Access | Full Access |
| **Live Telemetry Stream Controls** | Start / Stop | Monitor Feed |
| **Alert Threshold Configuration** | Modify & Save | View Thresholds |
| **Incident Resolution Workflow** | Acknowledge / Resolve | Acknowledge / Resolve |
| **Tableau & PDF Export** | Full Access | Full Access |
| **User Account Provisioning** | Create / Update / Delete | No Access |
| **System Security Audit Trail** | Full Access | No Access |

---

## 3. Step-by-Step Operator Guide

### 3.1 Authentication
1. Navigate to `http://localhost:5173`.
2. Use the one-click **Quick Demo Accounts** buttons:
   - **Admin Portal**: `admin@earthscape.org` / `Admin@123456`
   - **Analyst Portal**: `analyst@earthscape.org` / `Analyst@123456`
3. Click **Sign In to EarthScape**.

### 3.2 Ingesting a Climate Dataset
1. Select **Data Ingestion** from the sidebar navigation.
2. Select data source attribution (e.g. *National Weather Station Network*).
3. Drag & drop or select `data/sample/normal_data.csv` or `data/sample/anomaly_data.csv`.
4. Click **Ingest & Validate File**. The system validates headers, handles nulls, saves raw files to HDFS, and batch-inserts records into MongoDB.

### 3.3 Running Hadoop MapReduce Jobs
1. Navigate to **Hadoop & MapReduce**.
2. Choose an algorithm (e.g., *Comprehensive Climate MapReduce* or *Temperature Min/Max/Avg Reducer*).
3. Click **Execute MapReduce Job**.
4. Observe the live task tracker progress bar and terminal log console as Mappers, Shuffle/Sort, and Reducers execute.
5. Review the resulting summary matrix output written to `/earthscape/processed/`.

### 3.4 Predictive Machine Learning & Trend Projections
1. Navigate to **ML Predictions**.
2. Select parameter (*Temperature*, *Rainfall*, *CO2*, or *Humidity*), Horizon (*6-Months* to *5-Years*), and Polynomial Order.
3. Click **Train Model & Generate Projections**.
4. Inspect model fit ($R^2$, $RMSE$), historical points, and projected future trends with 95% confidence bands.

### 3.5 Anomaly Detection Hub
1. Navigate to **Anomaly Detection**.
2. Select target parameter and detection method (*Isolation Forest*, *Z-Score*, *IQR*, or *All*).
3. Click **Execute Anomaly Scan**.
4. Inspect detected anomalies with observed values, baseline limits, and severity ratings. Update investigation statuses directly from the table.

### 3.6 Real-Time Telemetry Stream
1. Navigate to **Real-Time Stream**.
2. Admins can click **Start Live Telemetry** to broadcast real-time packets across stations via Server-Sent Events (SSE).
3. Inspect live waveforms and incoming telemetry packets.

### 3.7 Generating Reports & Exporting to Tableau
1. Navigate to **Analysis Reports**.
2. Filter by station and date range, then click **Generate Analysis Report**.
3. Click **Export PDF Document** for an executive PDF report, or go to **Climate Records** and click **Tableau / CSV Export** for BI visualization.