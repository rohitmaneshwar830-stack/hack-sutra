import sys
import os
import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
import joblib

def train():
    print("Training forecast model...")
    # Load synthetic sensor data
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'sensor_readings.csv')
    if not os.path.exists(data_path):
        print(f"Data path {data_path} does not exist. Run database seed script first!")
        sys.exit(1)
        
    df = pd.read_csv(data_path)
    
    # We will train a simple auto-regressive model (Ridge Regression) to predict next 5 days of BOD
    # Feature engineering: create lags of BOD
    lags = 5
    X = []
    y = []
    
    for loc, group in df.groupby('location'):
        group = group.sort_values('timestamp')
        bod_vals = group['BOD'].values
        for i in range(lags, len(bod_vals) - 5):
            X.append(bod_vals[i-lags:i])
            y.append(bod_vals[i:i+5]) # Predict next 5 steps directly (multi-output)
            
    X = np.array(X)
    y = np.array(y)
    
    model = Ridge(alpha=1.0)
    model.fit(X, y)
    
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump(model, os.path.join(model_dir, 'forecast_model.pkl'))
    print("Forecast model trained and saved successfully.")

if __name__ == '__main__':
    train()
