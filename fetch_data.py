import requests
import pandas as pd

# Fetch data using API
def fetch_data(api_key, endpoint="your_api_endpoint"):
    response = requests.get(endpoint, params={"api_key": api_key})
    data = response.json()  # Assuming the data is in JSON format
    df = pd.DataFrame(data)

    # Save the fetched data to CSV
    df.to_csv("data/historical_player_stats.csv", index=False)
    print("✅ Data fetched and saved.")
