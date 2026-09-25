# EarthScape Climate Agency - Activity Flowcharts

This document specifies the operational flowcharts for all core business activities within the EarthScape Climate Platform.

---

## 1. User Authentication & Role Authorization Flowchart

```mermaid
flowchart TD
    Start([User Initiates Login]) --> InputCreds[/Input Email & Password/]
    InputCreds --> ValidateFormat{Format Valid?}
    
    ValidateFormat -- No --> ShowFormatError[Display Validation Error] --> InputCreds
    ValidateFormat -- Yes --> QueryUser[(Query User Store)]
    
    QueryUser --> UserExists{User Exists & Active?}
    UserExists -- No --> InvalidCreds[Return 401: Invalid Credentials] --> EndFail([Login Terminated])
    
    UserExists -- Yes --> CompareHash{Verify bcrypt Password Hash}
    CompareHash -- No --> InvalidCreds
    CompareHash -- Yes --> GenerateJWT[Generate Signed JWT Token with Role Payload]
    
    GenerateJWT --> CheckRole{User Role}
    CheckRole -- ADMIN --> NavAdmin[Redirect to /admin Admin Dashboard]
    CheckRole -- ANALYST --> NavAnalyst[Redirect to /analyst Analyst Dashboard]
    
    NavAdmin & NavAnalyst --> EndSuccess([Session Active])
```

---

## 2. Climate Data Ingestion & HDFS Persistence Flowchart

```mermaid
flowchart TD
    Start([Analyst Uploads File]) --> SelectFile[/Select CSV / JSON Climate File/]
    SelectFile --> MulterMiddleware[Multer Multipart Handler parses File Stream]
    
    MulterMiddleware --> CheckExtension{Supported Format?<br/>.csv or .json}
    CheckExtension -- No --> RejectFile[Reject: Invalid File Extension] --> EndFail([Ingestion Aborted])
    
    CheckExtension -- Yes --> StreamParser[Fast-CSV / JSON Stream Parser]
    StreamParser --> ValidateHeaders{Required Columns Present?<br/>date, location, temp, etc.}
    
    ValidateHeaders -- No --> SchemaError[Flag Validation Error: Missing Required Columns] --> EndFail
    ValidateHeaders -- Yes --> SanitizeData[Cast Numeric Fields, Impute Nulls, Format Timestamps]
    
    SanitizeData --> CheckStorageMode{Active Storage Mode}
    CheckStorageMode -- HDFS --> WriteHDFS[Save Raw File to HDFS /earthscape/raw/weather/]
    CheckStorageMode -- LOCAL --> WriteLocal[Save Raw File to Local Storage]
    
    WriteHDFS & WriteLocal --> BatchInsert[(Batch Insert Climate Records into Database)]
    BatchInsert --> RegisterDataset[(Create Dataset Ingestion Metadata Entry)]
    RegisterDataset --> LogAudit[(Record SYSTEM_LOG Audit Entry)]
    LogAudit --> SuccessNotify[/Send Ingestion Success Alert to Frontend/] --> EndSuccess([Ingestion Complete])
```

---

## 3. Hadoop MapReduce Job Execution Flowchart

```mermaid
flowchart TD
    Start([User Submits MapReduce Job]) --> SelectJobType[/Select Job Type & Dataset Target/]
    SelectJobType --> CreateJobEntry[(Generate Job ID & Status: Processing)]
    
    CreateJobEntry --> SplitCalculation[Calculate InputSplits across Climate Records]
    SplitCalculation --> MapPhase[Execute Python Streaming Mappers in Parallel]
    
    MapPhase --> EmitTuples[Mappers Emit Key-Value Pairs: Location -> Metric Tuples]
    EmitTuples --> ShuffleSort[Hadoop Framework Shuffles & Partitions Keys by Station]
    
    ShuffleSort --> ReducePhase[Execute Python Reducers on Grouped Node Partitions]
    ReducePhase --> ComputeAggs[Reducers Calculate Min, Max, Average, and Threshold Anomalies]
    
    ComputeAggs --> CheckOutputDest{Storage Mode}
    CheckOutputDest -- HDFS --> WriteHDFSOut[Write Result JSON to /earthscape/processed/]
    CheckOutputDest -- LOCAL --> WriteLocalOut[Write Result JSON to Local Processed Directory]
    
    WriteHDFSOut & WriteLocalOut --> UpdateJobDoc[(Update ProcessingJob Record: Status=Completed, Progress=100%)]
    UpdateJobDoc --> NotifyUI[/Update Job Center UI & Render Aggregates/] --> EndSuccess([Job Finalized])
```

---

## 4. Real-Time Streaming & Alert Evaluation Flowchart

```mermaid
flowchart TD
    Start([Simulation Stream Active]) --> IntervalTimer{Timer Interval Fired?<br/>Default: Every 3s}
    
    IntervalTimer -- Yes --> GenRecord[Generate Simulated Climate Reading with Variance]
    GenRecord --> PersistRecord[(Save Record with isSimulated=true)]
    
    PersistRecord --> FetchThresholds[(Load Active Alert Threshold Settings)]
    FetchThresholds --> CheckThresholds{Reading Exceeds Threshold?<br/>Temp > 45°C or Rain > 100mm etc.}
    
    CheckThresholds -- Yes --> CreateAlert[(Persist New Alert: Severity = High/Critical)]
    CreateAlert --> BroadcastSSE[/Broadcast Server-Sent Event: NEW_ALERT & CLIMATE_READING/]
    
    CheckThresholds -- No --> BroadcastNormal[/Broadcast Server-Sent Event: CLIMATE_READING/]
    
    BroadcastSSE & BroadcastNormal --> UIReceive[Frontend StreamContext Receives Event]
    UIReceive --> UpdateLiveCard[Update Real-time Telemetry Cards & Map Marker]
    UpdateLiveCard --> DisplayToast[Display Real-Time Toast Alert to User]
    
    DisplayToast --> IntervalTimer
```
