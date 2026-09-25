import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.metrics import r2_score, mean_squared_error

class ClimateTrendPredictor:
    def __init__(self, degree=2):
        self.degree = degree
        self.model = make_pipeline(PolynomialFeatures(degree=degree), Ridge(alpha=1.0))
        
    def fit_and_predict(self, df: pd.DataFrame, parameter='temperature', horizon_steps=12):
        """
        Fits polynomial time-series regression on historical climate data
        and projects future values over horizon_steps (e.g. 12 future months / intervals).
        """
        if df.empty or parameter not in df.columns:
            return {"error": f"Parameter {parameter} not found or dataset is empty"}
        
        # Sort by date
        df_clean = df.dropna(subset=['date', parameter]).sort_values('date').copy()
        if len(df_clean) < 3:
            return {"error": "Insufficient data points for ML model (minimum 3 required)"}

        # Convert date to sequential day offset from min date
        min_date = df_clean['date'].min()
        df_clean['day_offset'] = (df_clean['date'] - min_date).dt.days
        
        X = df_clean[['day_offset']].values
        y = df_clean[parameter].values

        self.model.fit(X, y)
        y_pred_hist = self.model.predict(X)
        r2 = float(r2_score(y, y_pred_hist))
        mse = float(mean_squared_error(y, y_pred_hist))
        rmse = float(np.sqrt(mse))

        # Generate future time points (e.g. 30 days interval per step)
        last_day = df_clean['day_offset'].max()
        last_date = df_clean['date'].max()
        
        future_offsets = np.array([last_day + (i + 1) * 30 for i in range(horizon_steps)]).reshape(-1, 1)
        future_preds = self.model.predict(future_offsets)

        predictions = []
        for i, pred_val in enumerate(future_preds):
            proj_date = last_date + pd.Timedelta(days=(i + 1) * 30)
            pred_float = float(np.round(pred_val, 2))
            # 95% Confidence estimate band (+/- 1.96 * RMSE)
            margin = float(np.round(1.96 * (rmse + 0.1), 2))
            predictions.append({
                "step": i + 1,
                "date": proj_date.strftime('%Y-%m-%d'),
                "predictedValue": pred_float,
                "lowerBound": float(np.round(pred_float - margin, 2)),
                "upperBound": float(np.round(pred_float + margin, 2)),
                "margin": margin
            })

        # Historical series sampled
        historical_sample = []
        step_stride = max(1, len(df_clean) // 30)
        for idx in range(0, len(df_clean), step_stride):
            row = df_clean.iloc[idx]
            historical_sample.append({
                "date": row['date'].strftime('%Y-%m-%d'),
                "actual": float(np.round(row[parameter], 2)),
                "fitted": float(np.round(y_pred_hist[idx], 2))
            })

        return {
            "parameter": parameter,
            "modelName": f"Polynomial Ridge Regressor (Degree={self.degree})",
            "modelVersion": "v2.1.0",
            "metrics": {
                "r2Score": max(0.0, float(np.round(r2, 3))),
                "mse": float(np.round(mse, 3)),
                "rmse": float(np.round(rmse, 3)),
                "trainingRecords": len(df_clean)
            },
            "historicalData": historical_sample,
            "predictions": predictions
        }
