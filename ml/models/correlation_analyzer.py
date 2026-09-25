import pandas as pd
import numpy as np

def compute_climate_correlations(df: pd.DataFrame):
    """
    Computes Pearson and Spearman correlation matrices across climate variables.
    """
    cols = ['temperature', 'humidity', 'rainfall', 'wind_speed', 'air_pressure', 'co2']
    valid_cols = [c for c in cols if c in df.columns]
    
    if len(df) < 3 or len(valid_cols) < 2:
        return {"error": "Insufficient data for correlation analysis"}

    sub_df = df[valid_cols].dropna()
    pearson_corr = sub_df.corr(method='pearson').round(3).to_dict()
    spearman_corr = sub_df.corr(method='spearman').round(3).to_dict()

    key_insights = []
    # Temp vs CO2
    if 'temperature' in pearson_corr and 'co2' in pearson_corr['temperature']:
        val = pearson_corr['temperature']['co2']
        key_insights.append({
            "pair": "Temperature ↔ CO2",
            "correlation": val,
            "relationship": "Strong Positive" if val > 0.6 else ("Moderate Positive" if val > 0.3 else "Weak/Neutral"),
            "interpretation": f"CO2 concentration exhibits a {val} correlation index with rising surface temperature."
        })

    # Temp vs Humidity
    if 'temperature' in pearson_corr and 'humidity' in pearson_corr['temperature']:
        val = pearson_corr['temperature']['humidity']
        key_insights.append({
            "pair": "Temperature ↔ Humidity",
            "correlation": val,
            "relationship": "Inverse/Negative" if val < -0.3 else "Positive",
            "interpretation": f"Relative humidity demonstrates a {val} correlation with temperature variations."
        })

    # Rainfall vs Humidity
    if 'rainfall' in pearson_corr and 'humidity' in pearson_corr['rainfall']:
        val = pearson_corr['rainfall']['humidity']
        key_insights.append({
            "pair": "Rainfall ↔ Humidity",
            "correlation": val,
            "relationship": "Positive",
            "interpretation": f"Precipitation patterns directly correlate with elevated ambient humidity ({val})."
        })

    return {
        "pearson": pearson_corr,
        "spearman": spearman_corr,
        "insights": key_insights,
        "sampleSize": len(sub_df)
    }
