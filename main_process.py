import pandas as pd
from fetch_data import fetch_data  # Assuming fetch_data function is in a file named fetch_data.py
from train_model import train_model  # Assuming train_model function is in a file named train_model.py
from predict_model import predict_top_players  # Assuming predict_top_players function is in a file named predict_model.py

# Step 1: Fetch Data (can be triggered periodically or on-demand)
api_key = "your_api_key"
fetch_data(api_key)

# Step 2: Train the model with fetched data (ensure this runs after data fetch)
train_model()

# Step 3: Make predictions based on new data (run prediction when required)
new_data = pd.read_csv("data/historical_player_stats.csv")  # You can load new data dynamically
predictions = predict_top_players(new_data)
print(predictions)

