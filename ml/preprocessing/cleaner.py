import pandas as pd
import numpy as np

def clean_climate_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw climate records dataframe: casts numeric fields, drops empty values,
    and strips string columns.
    """
    expected_cols = ['date', 'location', 'temperature', 'humidity', 'rainfall', 'wind_speed', 'air_pressure', 'co2']
    
    # Standardize column names
    df.columns = [c.lower().strip().replace(' ', '_') for c in df.columns]
    
    numeric_cols = ['temperature', 'humidity', 'rainfall', 'wind_speed', 'air_pressure', 'co2', 'latitude', 'longitude']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
    # Fill remaining NaNs with column medians for numeric, forward fill for dates
    for col in numeric_cols:
        if col in df.columns and df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median() if not np.isnan(df[col].median()) else 0)
            
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date']).sort_values('date')
        df['date_str'] = df['date'].dt.strftime('%Y-%m-%d')
        
    return df
