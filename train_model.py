# train_model.py

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

# Preprocess data and get the features
def get_features(df):
    feature_cols = ['bat_avg', 'bat_sr', 'bowl_avg', 'bowl_sr', 'death_overs_pct']
    return df[feature_cols].fillna(0)

# Train the model
def train_model(data_path="data/historical_player_stats.csv"):
    df = pd.read_csv(data_path)
    
    # Ensure the CSV contains the correct columns
    if df.empty:
        print("Error: Data is empty!")
        return

    X = get_features(df)
    y = df['is_top_performer']
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split into training and testing
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    # Train Random Forest Classifier
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Save the model
    joblib.dump(model, "ml/gl_model.pkl")
    print("✅ Model trained and saved as gl_model.pkl")
