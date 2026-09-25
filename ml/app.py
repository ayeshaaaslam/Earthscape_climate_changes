from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd

from preprocessing.cleaner import clean_climate_dataframe
from models.trend_predictor import ClimateTrendPredictor
from models.anomaly_detector import ClimateAnomalyDetector
from models.correlation_analyzer import compute_climate_correlations

app = FastAPI(
    title="EarthScape Machine Learning & Analytics Service",
    version="1.0.0",
    description="Python ML microservice for climate trend prediction, multi-method anomaly detection, and correlation analysis."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClimateDataPayload(BaseModel):
    records: List[Dict[str, Any]]
    parameter: Optional[str] = "temperature"
    horizonSteps: Optional[int] = 12
    location: Optional[str] = None
    degree: Optional[int] = 2
    method: Optional[str] = "All"
    contamination: Optional[float] = 0.03

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EarthScape Python ML Microservice",
        "models": ["Polynomial Ridge Regressor", "Z-score Anomaly", "IQR Outlier", "Isolation Forest", "Correlation Engine"]
    }

@app.post("/predict/trend")
def predict_climate_trend(payload: ClimateDataPayload):
    if not payload.records:
        raise HTTPException(status_code=400, detail="Empty records array received")

    df = pd.DataFrame(payload.records)
    df = clean_climate_dataframe(df)

    if payload.location and 'location' in df.columns:
        df = df[df['location'].str.lower() == payload.location.lower()]
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No records found for location {payload.location}")

    predictor = ClimateTrendPredictor(degree=payload.degree or 2)
    result = predictor.fit_and_predict(
        df,
        parameter=payload.parameter or "temperature",
        horizon_steps=payload.horizonSteps or 12
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "success": True,
        "location": payload.location or "All Stations Aggregated",
        "data": result
    }

@app.post("/detect/anomalies")
def detect_anomalies(payload: ClimateDataPayload):
    if not payload.records:
        raise HTTPException(status_code=400, detail="Empty records array received")

    df = pd.DataFrame(payload.records)
    df = clean_climate_dataframe(df)

    detector = ClimateAnomalyDetector()
    method = (payload.method or "All").lower()

    anomalies = []
    if method in ["z-score", "all"]:
        anomalies.extend(detector.detect_zscore(df, parameter=payload.parameter or "temperature"))
    if method in ["iqr", "all"]:
        anomalies.extend(detector.detect_iqr(df, parameter=payload.parameter or "temperature"))
    if method in ["isolation forest", "all"]:
        anomalies.extend(detector.detect_isolation_forest(df, contamination=payload.contamination or 0.03))

    # De-duplicate anomalies by date + location + parameter
    unique_anomalies = {}
    for a in anomalies:
        key = f"{a['date']}_{a['location']}_{a['parameter']}"
        if key not in unique_anomalies:
            unique_anomalies[key] = a

    result_list = list(unique_anomalies.values())
    return {
        "success": True,
        "totalDetected": len(result_list),
        "anomalies": result_list
    }

@app.post("/analytics/correlations")
def get_correlations(payload: ClimateDataPayload):
    if not payload.records:
        raise HTTPException(status_code=400, detail="Empty records array received")

    df = pd.DataFrame(payload.records)
    df = clean_climate_dataframe(df)

    result = compute_climate_correlations(df)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "success": True,
        "data": result
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
