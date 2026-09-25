# EarthScape Climate Agency – Test Plan & Verification Matrix

## 1. Authentication & Security Test Suite

| Test ID | Test Scenario | Input Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Admin Login Success | `admin@earthscape.org` / `Admin@123456` | 200 OK, JWT returned, redirected to Admin Dashboard | **PASSED** |
| **TC-AUTH-02** | Analyst Login Success | `analyst@earthscape.org` / `Analyst@123456` | 200 OK, JWT returned, redirected to Analyst Dashboard | **PASSED** |
| **TC-AUTH-03** | Invalid Password Attempt | `admin@earthscape.org` / `WrongPass` | 401 Unauthorized, audit log warning created | **PASSED** |
| **TC-AUTH-04** | Role Restriction Check | Analyst accessing `/api/users` | 403 Forbidden with descriptive error | **PASSED** |

---

## 2. Ingestion & Validation Test Suite

| Test ID | Test Scenario | Input File | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-ING-01** | Valid CSV Ingestion | `normal_data.csv` (2,920 rows) | 201 Created, all 2,920 records inserted, HDFS path populated | **PASSED** |
| **TC-ING-02** | Anomaly CSV Ingestion | `anomaly_data.csv` | 201 Created, extreme outliers parsed and stored | **PASSED** |
| **TC-ING-03** | Invalid File Rejection | `.exe` or corrupt file | 400 Bad Request: Only CSV/JSON accepted | **PASSED** |

---

## 3. Big Data & MapReduce Test Suite

| Test ID | Test Scenario | Job Type | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-MR-01** | Comprehensive MapReduce | `COMPREHENSIVE_MAPREDUCE` | Job progress increments 0% to 100%, generates location aggregates | **PASSED** |
| **TC-MR-02** | Temperature Reducer | `TEMPERATURE_STATS` | Correctly computes Min, Max, and Avg temperature by location | **PASSED** |
| **TC-MR-03** | Outlier Scan MapReduce | `ANOMALY_DETECTION` | Emits keys for records exceeding configured thresholds | **PASSED** |

---

## 4. Machine Learning & Anomaly Detection Test Suite

| Test ID | Test Scenario | Target Parameter | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-ML-01** | Temperature Trend Regressor | `temperature`, 12 steps | Generates polynomial curve, R² > 0.85, 95% confidence bands | **PASSED** |
| **TC-ML-02** | Isolation Forest ML Scan | Multi-parameter | Unsupervised model flags multivariate outliers with severity ratings | **PASSED** |
| **TC-ML-03** | Pearson Correlation Engine | All parameters | Pearson r matrix computed (e.g. Temp ↔ CO2 strong positive) | **PASSED** |

---

## 5. Live Telemetry & Alerting Test Suite

| Test ID | Test Scenario | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-SIM-01** | Real-Time SSE Streaming | Start stream | Packets broadcast every 3s, waveform chart animates | **PASSED** |
| **TC-ALT-01** | Automated Alert Trigger | Temp > 45°C packet generated | Active alert recorded, notification badge pulses | **PASSED** |
| **TC-ALT-02** | Threshold Customization | TempMax changed to 48°C | Settings saved, new threshold applied to subsequent stream packets | **PASSED** |