# EarthScape Climate Agency – System Architecture & Data Flow Diagrams

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph Data Sources Layer
        WS[Weather Stations]
        SAT[Satellite Telemetry]
        IOT[Environmental IoT Sensors]
        SIM[Real-Time Simulator Service]
    end

    subgraph Ingestion & Storage Layer
        ING[Data Ingestion Controller / Multer]
        VAL[CSV / JSON Validator & Cleaner]
        HDFS[(HDFS Storage Engine / Local Stage)]
        MDB[(MongoDB Database)]
    end

    subgraph Big Data & ML Layer
        MR[Hadoop MapReduce Engine]
        ML[Python FastAPI Machine Learning Microservice]
        POLY[Polynomial Trend Regressors]
        ANOM[Z-Score / IQR / Isolation Forest]
    end

    subgraph Application & Presentation Layer
        API[Express.js REST API Backend]
        SEC[JWT & Role-Based Authorization]
        SSE[Server-Sent Events Telemetry Stream]
        UI[React + Vite + Tailwind Dashboard Frontend]
        MAP[Leaflet GIS Interactive Map]
        TAB[Tableau / CSV & PDF Export]
    end

    WS --> ING
    SAT --> ING
    IOT --> ING
    SIM --> SSE
    ING --> VAL
    VAL --> HDFS
    VAL --> MDB
    MDB <--> API
    HDFS <--> MR
    MR --> MDB
    API <--> ML
    ML --> POLY
    ML --> ANOM
    API --> SEC
    API --> SSE
    SEC --> UI
    SSE --> UI
    UI --> MAP
    UI --> TAB
```

---

## 2. Context-Level DFD (Level 0)

```mermaid
graph LR
    ADMIN((Administrator)) <-->|Manage Users, Config Thresholds, Inspect Logs| SYS[EarthScape Climate System]
    ANALYST((Analyst)) <-->|Query Data, Run ML & MapReduce, Submit Support| SYS
    SENSORS((Climate Sensors / Simulator)) -->|Raw Telemetry Stream| SYS
    SYS -->|Tableau CSV / PDF Reports| EXT[Tableau & PDF Documents]
```

---

## 3. Data Flow Diagram Level 1

```mermaid
graph TD
    U[User: Admin / Analyst] -->|1. Credentials| P1[1.0 Authentication & RBAC]
    P1 -->|Auth Token| U
    
    U -->|2. Upload CSV/JSON| P2[2.0 Ingestion & Validation]
    P2 -->|Valid Records| D1[(Climate Records DB)]
    P2 -->|Raw Files| D2[(HDFS Raw Storage)]

    U -->|3. Trigger Job| P3[3.0 Hadoop MapReduce]
    D2 --> P3
    P3 -->|Aggregated Metrics| D3[(HDFS Processed Storage)]
    P3 -->|Job Results| D1

    U -->|4. Request Prediction / Anomaly Scan| P4[4.0 Python ML Service]
    D1 --> P4
    P4 -->|Projections & Outliers| D4[(Predictions & Anomalies DB)]
    P4 -->|Results| U

    P5[5.0 Real-Time Simulator] -->|Stream Telemetry| P6[6.0 Alert Engine]
    P6 -->|Breach Alert| D5[(Alerts DB)]
    P6 -->|Live Telemetry Packet| U
```

---

## 4. Operational Flowcharts

### A. Data Ingestion & Validation Flowchart
```mermaid
graph TD
    Start([Upload File]) --> ExtCheck{Extension .csv or .json?}
    ExtCheck -- No --> Reject[Reject with Invalid File Type Error]
    ExtCheck -- Yes --> Parse[Parse & Validate Schema Headers]
    Parse --> HeaderCheck{Required Columns Present?}
    HeaderCheck -- No --> SchemaErr[Reject: Missing Required Headers]
    HeaderCheck -- Yes --> TypeCast[Cast Types & Strip Invalid Numeric Values]
    TypeCast --> SaveHDFS[Persist Raw File to HDFS / Local Partition]
    SaveHDFS --> SaveMongo[Batch Insert Records into MongoDB]
    SaveMongo --> AuditLog[Write Action to System Audit Trail]
    AuditLog --> Success([Return Ingestion Summary & Record Count])
```

### B. Machine Learning Trend Prediction Flowchart
```mermaid
graph TD
    MLStart([Select Parameter & Horizon]) --> FetchRecs[Fetch Historical Climate Time-Series]
    FetchRecs --> CheckCount{Records >= 3?}
    CheckCount -- No --> InsuffErr[Error: Insufficient Historical Basis]
    CheckCount -- Yes --> Preprocess[Compute Date Offsets & Standardize Features]
    Preprocess --> FitModel[Train Polynomial Ridge Regression Model]
    FitModel --> CalcMetrics[Calculate R² Score, MSE, RMSE]
    FitModel --> ProjectFuture[Project Future Steps with 95% Confidence Bounds]
    ProjectFuture --> ReturnResult([Render Predictive Curve & Historical Actuals])
```