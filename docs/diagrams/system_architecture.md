# EarthScape Climate Agency - System Architecture Documentation

This document illustrates the complete end-to-end multi-tier architecture of the **EarthScape Climate Monitoring and Analytics Platform**.

## Architectural Overview

The EarthScape system is engineered with a decoupled, high-performance distributed architecture spanning 4 key operational tiers:
1. **Presentation Tier (Frontend Client)**: Single Page Application built on React 18, Vite, and Tailwind CSS. Provides real-time geospatial interactive visualizations (Leaflet maps), time-series charts (Recharts), and role-tailored dashboards.
2. **Application & API Gateway Tier (Node.js/Express)**: Manages authentication (JWT, RBAC), request dispatching, file upload validation, MapReduce simulation dispatch, and real-time Server-Sent Events (SSE) data streaming.
3. **Big Data Storage & Processing Tier (Hadoop / HDFS / MapReduce / Impala)**: Fault-tolerant distributed storage in HDFS partitioned by location/date, with Python MapReduce mappers/reducers and Apache Impala for lightning-fast SQL warehouse queries.
4. **Machine Learning & Analytics Tier (Python FastAPI Microservice)**: Scikit-learn powered microservice delivering multi-algorithm anomaly detection (Isolation Forest, Z-Score, IQR), polynomial ridge trend regression, and statistical correlation calculations.

---

## Architecture Diagram (Mermaid)

```mermaid
graph TB
    subgraph Client_Tier ["Presentation Tier (Frontend Client)"]
        UI["React 18 Single Page Application<br/>(Vite + Tailwind CSS + Lucide)"]
        Dashboards["Role Dashboards<br/>(Admin & Climate Analyst)"]
        MapEngine["Geospatial Map Engine<br/>(Leaflet.js + Recharts)"]
        StreamClient["Real-time SSE Stream Listener"]
        UI --> Dashboards
        UI --> MapEngine
        UI --> StreamClient
    end

    subgraph API_Gateway ["Application & Gateway Tier (Node.js / Express)"]
        Gateway["Express.js API Gateway (:5000)"]
        AuthModule["Auth & RBAC Module<br/>(JWT + bcrypt)"]
        IngestionEngine["Data Ingestion & CSV Parser<br/>(Multer + Fast-CSV)"]
        SSEHub["Real-time Climate Simulation SSE Hub"]
        MRDispatcher["Hadoop MapReduce Job Dispatcher"]
        Gateway --> AuthModule
        Gateway --> IngestionEngine
        Gateway --> SSEHub
        Gateway --> MRDispatcher
    end

    subgraph Big_Data_Tier ["Big Data Storage & Analytics (Hadoop Ecosystem)"]
        HDFS["Hadoop Distributed File System (HDFS)<br/>/earthscape/raw/ & /processed/"]
        MapReduce["Hadoop MapReduce Engine<br/>(Python Streaming Mappers & Reducers)"]
        ImpalaHive["Apache Impala / Hive Data Warehouse<br/>(Parquet Columnar Storage)"]
        HDFS <--> MapReduce
        HDFS <--> ImpalaHive
    end

    subgraph ML_Tier ["Machine Learning Microservice Tier (Python FastAPI)"]
        FastAPI["FastAPI Microservice (:8000)"]
        TrendModel["Polynomial Ridge Regressor<br/>(95% Confidence Forecasts)"]
        AnomalyEngine["Isolation Forest & IQR<br/>Multi-variate Anomaly Detection"]
        CorrEngine["Pearson & Spearman Correlation Engine"]
        FastAPI --> TrendModel
        FastAPI --> AnomalyEngine
        FastAPI --> CorrEngine
    end

    subgraph Database_Tier ["Operational Database Tier"]
        MongoDB["MongoDB / MongoMemoryServer Engine<br/>(Users, Logs, Metadata, Alerts, Datasets)"]
    end

    %% Network Connections
    Client_Tier <==>|HTTP / REST JSON & SSE| API_Gateway
    API_Gateway <==>|Mongoose ODM Driver| Database_Tier
    API_Gateway <==>|Internal REST API| ML_Tier
    API_Gateway <==>|HDFS WebHDFS / Job Control| Big_Data_Tier
```

---

## Tier-by-Tier Component Specifications

| Tier | Technology Stack | Key Responsibilities |
| :--- | :--- | :--- |
| **Presentation Tier** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts | Interactive dashboards, geospatial anomaly mapping, data ingestion forms, real-time alert toast indicators |
| **Gateway Tier** | Node.js v20+, Express 4.x, Multer, Fast-CSV | JWT token issue/validation, RBAC middleware, SSE event multiplexer, algorithmic fallback engines |
| **Big Data Tier** | Apache Hadoop 3.x, HDFS, Python Streaming MapReduce, Apache Impala | Distributed storage of terabyte-scale sensor files, parallel aggregations, high-concurrency analytical queries |
| **Machine Learning Tier**| Python 3.10+, FastAPI, Scikit-Learn, Pandas, NumPy | Anomaly score ranking, future time-series projection, covariance & correlation matrices |
| **Database Tier** | MongoDB 7.x / High-Performance In-Memory Mongo Engine | System configurations, user profiles, processed job logs, active threshold definitions, ticketing |
