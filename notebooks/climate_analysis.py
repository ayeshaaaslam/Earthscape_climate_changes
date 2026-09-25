#!/usr/bin/env python3
"""
EarthScape Climate Agency - Climate Data Exploratory Analysis & ML Training
Environment: Python 3.10+ / Anaconda
"""
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.ensemble import IsolationForest
from sklearn.metrics import mean_squared_error, r2_score

def run_climate_analysis():
    print("==================================================================")
    print(" EARTHSCAPE CLIMATE AGENCY - BIG DATA & ML ANALYTICS PIPELINE     ")
    print("==================================================================")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))

    normal_path = os.path.join(project_root, 'data', 'sample', 'normal_data.csv')
    anomaly_path = os.path.join(project_root, 'data', 'sample', 'anomaly_data.csv')

    print(f"[*] Ingesting baseline datasets:\n  - Normal: {normal_path}\n  - Anomaly: {anomaly_path}")
    df_normal = pd.read_csv(normal_path)
    df_anomaly = pd.read_csv(anomaly_path)
    df = pd.concat([df_normal, df_anomaly], ignore_index=True)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(['location', 'date']).reset_index(drop=True)

    print(f"[+] Total records loaded: {len(df):,}")
    print(f"[+] Weather Stations analyzed: {df['location'].nunique()} ({list(df['location'].unique())})")

    # Features
    features = ['temperature', 'humidity', 'rainfall', 'wind_speed', 'air_pressure', 'co2']
    print("\n--- Summary Statistics ---")
    print(df[features].describe().round(2))

    # Correlations
    print("\n--- Pearson Correlation Matrix ---")
    corr = df[features].corr(method='pearson').round(3)
    print(corr)

    # Anomaly Detection
    print("\n--- Anomaly Detection (Isolation Forest) ---")
    iso = IsolationForest(contamination=0.03, random_state=42)
    df['is_anomaly_iso'] = iso.fit_predict(df[features])
    anomalies_detected = (df['is_anomaly_iso'] == -1).sum()
    print(f"[!] Anomalies identified by Isolation Forest: {anomalies_detected} ({anomalies_detected/len(df)*100:.2f}%)")

    # Predictive Modeling
    print("\n--- Time-Series Predictive Modeling (Polynomial Ridge Regressor) ---")
    sample_loc = df['location'].unique()[0]
    loc_df = df[df['location'] == sample_loc].copy().sort_values('date')
    min_date = loc_df['date'].min()
    loc_df['day_offset'] = (loc_df['date'] - min_date).dt.days

    X = loc_df[['day_offset']].values
    y = loc_df['temperature'].values

    model = make_pipeline(PolynomialFeatures(degree=2), Ridge(alpha=1.0))
    model.fit(X, y)
    y_pred = model.predict(X)

    r2 = r2_score(y, y_pred)
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    print(f"[+] Target Station: {sample_loc}")
    print(f"[+] Model Evaluation: R² = {r2:.4f}, RMSE = {rmse:.2f} °C")

    # Generate Tableau dataset
    processed_dir = os.path.join(project_root, 'data', 'processed')
    os.makedirs(processed_dir, exist_ok=True)
    tableau_file = os.path.join(processed_dir, 'earthscape_tableau_master.csv')
    df.to_csv(tableau_file, index=False)
    print(f"\n[+] Master Tableau analytical dataset exported to:\n    {tableau_file}")
    print("==================================================================")
    print(" Analysis execution completed successfully! ")
    print("==================================================================")

if __name__ == '__main__':
    run_climate_analysis()
