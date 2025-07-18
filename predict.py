import pandas as pd
import joblib
from ml.train import get_features

model = joblib.load("ml/gl_model.pkl")

def predict_top_players(players: list, match_id: str) -> list:
    stats_df = pd.read_csv(f"data/player_stats_{match_id}.csv")
    stats_df = stats_df[stats_df['player'].isin(players)]
    X = get_features(stats_df)
    stats_df['score'] = model.predict_proba(X)[:, 1]
    ranked = stats_df.sort_values("score", ascending=False).reset_index(drop=True)
    return ranked.to_dict(orient="records")
