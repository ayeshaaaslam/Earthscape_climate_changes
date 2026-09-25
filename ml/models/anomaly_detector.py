import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class ClimateAnomalyDetector:
    def __init__(self):
        pass

    def detect_zscore(self, df: pd.DataFrame, parameter='temperature', threshold=2.5):
        """
        Z-Score Anomaly Detection
        """
        series = df[parameter].dropna()
        if len(series) < 3:
            return []
        mean = series.mean()
        std = series.std()
        if std == 0:
            return []

        anomalies = []
        for idx, val in series.items():
            z = abs((val - mean) / std)
            if z > threshold:
                row = df.loc[idx]
                severity = 'Critical' if z > 3.5 else ('High' if z > 3.0 else 'Medium')
                anomalies.append({
                    "date": row['date'].strftime('%Y-%m-%d') if hasattr(row['date'], 'strftime') else str(row['date']),
                    "location": row.get('location', 'Station'),
                    "parameter": parameter,
                    "observedValue": float(np.round(val, 2)),
                    "expectedRange": f"{round(mean - 2*std, 1)} - {round(mean + 2*std, 1)}",
                    "severity": severity,
                    "method": "Z-score",
                    "score": float(np.round(z, 2))
                })
        return anomalies

    def detect_iqr(self, df: pd.DataFrame, parameter='temperature', multiplier=1.5):
        """
        Interquartile Range (IQR) Anomaly Detection
        """
        series = df[parameter].dropna()
        if len(series) < 4:
            return []
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - (multiplier * iqr)
        upper_bound = q3 + (multiplier * iqr)

        anomalies = []
        for idx, val in series.items():
            if val < lower_bound or val > upper_bound:
                row = df.loc[idx]
                deviation = max(lower_bound - val, val - upper_bound)
                severity = 'Critical' if deviation > 2 * iqr else ('High' if deviation > iqr else 'Medium')
                anomalies.append({
                    "date": row['date'].strftime('%Y-%m-%d') if hasattr(row['date'], 'strftime') else str(row['date']),
                    "location": row.get('location', 'Station'),
                    "parameter": parameter,
                    "observedValue": float(np.round(val, 2)),
                    "expectedRange": f"{round(lower_bound, 1)} - {round(upper_bound, 1)}",
                    "severity": severity,
                    "method": "IQR",
                    "score": float(np.round(deviation, 2))
                })
        return anomalies

    def detect_isolation_forest(self, df: pd.DataFrame, contamination=0.03):
        """
        Machine Learning Isolation Forest Multi-parameter Outlier Detection
        """
        features = ['temperature', 'humidity', 'rainfall', 'wind_speed', 'air_pressure', 'co2']
        available_feats = [f for f in features if f in df.columns]
        if len(df) < 10 or len(available_feats) < 2:
            return []

        clean_sub = df.dropna(subset=available_feats).copy()
        if len(clean_sub) < 10:
            return []

        X = clean_sub[available_feats].values
        iso = IsolationForest(contamination=contamination, random_state=42)
        preds = iso.fit_predict(X)
        scores = iso.decision_function(X)

        anomalies = []
        for i, (pred, score) in enumerate(zip(preds, scores)):
            if pred == -1: # Outlier
                row = clean_sub.iloc[i]
                # Find parameter that deviated most
                worst_param = 'temperature'
                max_dev = 0
                for f in available_feats:
                    col_mean = clean_sub[f].mean()
                    col_std = clean_sub[f].std() or 1
                    dev = abs(row[f] - col_mean) / col_std
                    if dev > max_dev:
                        max_dev = dev
                        worst_param = f

                severity = 'Critical' if score < -0.15 else ('High' if score < -0.08 else 'Medium')
                anomalies.append({
                    "date": row['date'].strftime('%Y-%m-%d') if hasattr(row['date'], 'strftime') else str(row['date']),
                    "location": row.get('location', 'Station'),
                    "parameter": worst_param,
                    "observedValue": float(np.round(row[worst_param], 2)),
                    "expectedRange": f"Multi-feature Cluster Bound",
                    "severity": severity,
                    "method": "Isolation Forest",
                    "score": float(np.round(abs(score), 3))
                })
        return anomalies
