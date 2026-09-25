# EarthScape Climate Agency - Database Entity Relationship Diagram (ERD)

This document details the Entity Relationship Diagram and schema definitions for the operational database powering the EarthScape Climate Platform.

---

## Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ DATASET : "uploads"
    USER ||--o{ SUPPORT_TICKET : "submits"
    USER ||--o{ SYSTEM_LOG : "triggers"
    DATASET ||--o{ CLIMATE_RECORD : "contains"
    CLIMATE_RECORD ||--o{ ANOMALY : "referenced_by"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "ADMIN | ANALYST"
        string status "ACTIVE | SUSPENDED"
        date createdAt
        date updatedAt
    }

    DATASET {
        ObjectId _id PK
        string fileName
        string fileType "CSV | JSON"
        string source
        int recordCount
        int fileSize
        string storagePath
        string storageMode "HDFS | LOCAL"
        string status "UPLOADED | VALIDATED | PROCESSED | FAILED"
        ObjectId uploadedBy FK
        string uploaderName
        date createdAt
    }

    CLIMATE_RECORD {
        ObjectId _id PK
        string date "Index: YYYY-MM-DD"
        string location "Index"
        float latitude
        float longitude
        float temperature "Celsius"
        float humidity "Percentage"
        float rainfall "mm"
        float windSpeed "km/h"
        float airPressure "hPa"
        float co2 "ppm"
        string source
        boolean isSimulated
        ObjectId datasetId FK
        date createdAt
    }

    PROCESSING_JOB {
        ObjectId _id PK
        string jobId UK
        string jobType "TEMPERATURE_STATS | RAINFALL_STATS | COMPREHENSIVE_MAPREDUCE"
        string status "Queued | Processing | Completed | Failed"
        string storageMode "HDFS | LOCAL"
        int recordCount
        int progress "0 - 100"
        json resultSummary
        array logs
        date startedAt
        date completedAt
    }

    ANOMALY {
        ObjectId _id PK
        string date
        string location "Index"
        string parameter "temperature | rainfall | co2 | humidity"
        float observedValue
        string expectedRange
        string severity "Low | Medium | High | Critical"
        string method "Z-score | IQR | Isolation Forest | Threshold MapReduce"
        string status "Detected | Investigating | Resolved | Dismissed"
        string notes
        ObjectId recordId FK
        date createdAt
    }

    PREDICTION {
        ObjectId _id PK
        string location "Index"
        string parameter
        string horizon "1-Month | 6-Month | 1-Year | 5-Year"
        string predictionDate
        float predictedValue
        float lowerBound
        float upperBound
        string modelName
        string modelVersion
        float confidenceScore
        int historicalBasisCount
        date createdAt
    }

    ALERT {
        ObjectId _id PK
        string location "Index"
        string parameter
        float value
        float threshold
        string severity "Low | Medium | High | Critical"
        string message
        string status "Active | Acknowledged | Resolved"
        string resolvedBy
        date resolvedAt
        date createdAt
    }

    ALERT_SETTING {
        ObjectId _id PK
        string key UK "global_thresholds"
        float tempMax
        float tempMin
        float rainfallMax
        float humidityMax
        float co2Max
        float windSpeedMax
        float airPressureMin
        float airPressureMax
        string storageMode "HDFS | LOCAL"
        int simulationIntervalSec
        boolean isSimulationActive
        date updatedAt
    }

    SUPPORT_TICKET {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string email
        string subject
        string category "Technical Issue | Data Issue | Dashboard Issue | Other"
        string message
        string priority "Low | Medium | High | Urgent"
        string status "Open | In Progress | Resolved | Closed"
        string adminResponse
        string adminName
        date resolvedAt
        date createdAt
    }

    SYSTEM_LOG {
        ObjectId _id PK
        string action
        string category "AUTH | DATA_INGESTION | MAPREDUCE | ML_PREDICTION | ALERT | SETTINGS"
        ObjectId userId FK
        string userName
        string details
        string ipAddress
        string status "SUCCESS | WARNING | FAILURE"
        date createdAt
    }
```
