import sys
import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

def train():
    print("Training source classifier...")
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'classifier_training.csv')
    if not os.path.exists(data_path):
        print(f"Data path {data_path} does not exist. Run database seed script first!")
        sys.exit(1)
        
    df = pd.read_csv(data_path)
    
    X = df[['chromium', 'lead', 'mercury', 'bod', 'do', 'turbidity']]
    y = df['source_label']
    
    clf = RandomForestClassifier(n_estimators=50, random_state=42)
    clf.fit(X, y)
    
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump(clf, os.path.join(model_dir, 'classifier_model.pkl'))
    print("Classifier model trained and saved successfully.")

if __name__ == '__main__':
    train()
