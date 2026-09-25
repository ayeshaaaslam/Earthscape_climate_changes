# EarthScape Climate Agency - Data Flow Diagrams (DFDs)

This document specifies the Data Flow Diagrams across three decomposition levels: Context Level (Level 0), Subsystem Level (Level 1), and Process Detailed Level (Level 2).

---

## 1. DFD Level 0: Context Level Diagram

The Context Diagram defines the system boundary for the EarthScape Climate Platform and highlights external entities interacting with the platform.

```mermaid
graph LR
    Admin["Climate Administrator"]
    Analyst["Climate Analyst / Researcher"]
    Sensor["External Sensors & Satellites"]
    
    System(("0.0<br/>EarthScape Climate<br/>Monitoring & Big Data<br/>Platform"))
    
    Admin -->|"User Credentials & Config Thresholds"| System
    System -->|"Audit Logs, System Status & Alerts"| Admin
    
    Analyst -->|"Dataset Uploads, Query Params & Simulation Requests"| System
    System -->|"Dashboards, Anomalies, Forecasts & CSV Exports"| Analyst
    
    Sensor -->|"Raw Climate Stream (Temp, Rain, CO2, Pressure)"| System
```

---

## 2. DFD Level 1: Subsystem Decomposition Diagram

Level 1 decomposes the EarthScape platform into core functional subsystems and data stores.

```mermaid
graph TD
    User["User (Admin / Analyst)"]
    Sensors["External Data Sources (Weather/Satellite)"]

    %% Processes
    P1(("1.0<br/>Authentication &<br/>Role Validation"))
    P2(("2.0<br/>Data Ingestion &<br/>Validation"))
    P3(("3.0<br/>HDFS & MapReduce<br/>Processing"))
    P4(("4.0<br/>Machine Learning<br/>& Predictive Engine"))
    P5(("5.0<br/>Real-Time Alert &<br/>Simulation Engine"))
    P6(("6.0<br/>Interactive Visualization<br/>& Reporting"))

    %% Data Stores
    D1[("D1: User Store (MongoDB)")]
    D2[("D2: Climate Records & Datasets")]
    D3[("D3: HDFS Data Lake")]
    D4[("D4: Processing Jobs & Logs")]
    D5[("D5: Anomalies & Alert Rules")]

    %% Flows
    User -->|Login Credentials| P1
    P1 <-->|Verify Credentials & Permissions| D1
    P1 -->|Authenticated Session Token| User

    Sensors -->|Raw CSV / Streams| P2
    User -->|Upload Dataset Files| P2
    P2 -->|Validated Records| D2
    P2 -->|Bulk Storage Ingest| D3

    P3 <-->|Batch Fetch Data| D3
    P3 -->|Write Intermediate & Reduced Metrics| D4
    P3 -->|Discovered Threshold Outliers| D5

    P4 <-->|Fetch Clean Historical Series| D2
    P4 -->|Predictive Trends & Anomaly Scores| D5

    P5 <-->|Evaluate Against Dynamic Rules| D5
    P5 -->|Broadcast Critical Climate Alerts| User

    D2 -->|Read Observations| P6
    D4 -->|Job Status| P6
    D5 -->|Anomalies & Forecasts| P6
    P6 -->|Render Charts, Maps & Reports| User
```

---

## 3. DFD Level 2: Detailed Process Pipelines

### 3.1 Data Flow 2.1: Hadoop MapReduce Data Pipeline

```mermaid
graph LR
    Input["HDFS Input Splits<br/>(/earthscape/raw/weather/*.csv)"]
    
    subgraph MapStage ["Map Stage"]
        M1["Mapper Node 1<br/>(temperature_mapper.py)"]
        M2["Mapper Node 2<br/>(rainfall_mapper.py)"]
        M3["Mapper Node 3<br/>(anomaly_mapper.py)"]
    end
    
    subgraph ShuffleSort ["Shuffle & Sort"]
        Partitioner["Hash Partitioner by Location Key"]
    end
    
    subgraph ReduceStage ["Reduce Stage"]
        R1["Reducer Node 1<br/>(Avg/Min/Max Temperature)"]
        R2["Reducer Node 2<br/>(Cumulative Rainfall)"]
        R3["Reducer Node 3<br/>(Outlier Aggregation)"]
    end
    
    Output["HDFS Processed Storage & MongoDB Analytics Store"]

    Input --> M1 & M2 & M3
    M1 & M2 & M3 --> Partitioner
    Partitioner --> R1 & R2 & R3
    R1 & R2 & R3 --> Output
```

### 3.2 Data Flow 2.2: Machine Learning Prediction & Anomaly Pipeline

```mermaid
graph TD
    RawData["Ingested Climate Data Records"] --> Cleaner["Preprocessing & Data Sanitizer<br/>(Impute NaNs, Sort by Date, Cast Datatypes)"]
    
    Cleaner --> Branch1["Trend Analysis Branch"]
    Cleaner --> Branch2["Multi-Variate Outlier Branch"]
    Cleaner --> Branch3["Correlation Branch"]
    
    Branch1 --> PolyReg["Polynomial Ridge Regressor (Degree=2)<br/>Cross-Validated with RMSE & R²"]
    PolyReg --> ForecastOut["12-Month Projected Trends<br/>with 95% Confidence Intervals"]
    
    Branch2 --> IsoForest["Scikit-Learn Isolation Forest Engine<br/>Contamination = 0.03"]
    Branch2 --> StatEngine["Z-Score & Interquartile Range (IQR) Evaluator"]
    IsoForest & StatEngine --> AnomMerge["Deduplicated Anomaly Repository"]
    
    Branch3 --> CorrMatrix["Pearson & Spearman Covariance Matrix Engine"]
    
    ForecastOut & AnomMerge & CorrMatrix --> Presentation["Interactive Frontend Dashboards & Map Pins"]
```
