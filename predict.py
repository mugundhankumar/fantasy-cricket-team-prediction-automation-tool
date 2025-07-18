from database import AsyncSessionLocal, Player, Prediction
from sqlalchemy.future import select
from utils.team_generator import generate_team
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fetch_all_player_data(session: AsyncSessionLocal) -> List[Dict]:
    """
    Fetch all player and prediction data in one query to optimize performance.
    """
    stmt = select(Player, Prediction).join(Prediction, Player.id == Prediction.player_id, isouter=True)
    result = await session.execute(stmt)
    players = []
    for player, prediction in result.all():
        players.append({
            "id": player.id,
            "name": player.name,
            "batting_average": player.batting_average,
            "bowling_average": player.bowling_average,
            "performance": None,  # Placeholder, can be extended
            "predicted_score": prediction.predicted_score if prediction else None,
            "ownership": prediction.ownership_percent if prediction else None,
            "mindset": prediction.mindset if prediction else None,
            "credits": 0,  # Placeholder
            "role": "Batter"  # Placeholder
        })
    return players

async def predict_top_players(player_names: List[str], match_id: str) -> List[Dict]:
    """
    Predict top players based on AI/ML models and database data.
    """
    async with AsyncSessionLocal() as session:
        players_data = await fetch_all_player_data(session)

    # Filter players by player_names
    filtered_players = [p for p in players_data if p["name"] in player_names]

    # Here you can add standardization or ML model calls if needed
    # For now, we sort by predicted_score or fallback to 0
    filtered_players.sort(key=lambda x: x.get("predicted_score") or 0, reverse=True)

    # Generate balanced teams using utility
    teams = generate_team(filtered_players, None, None, None, None, None, max_combinations=1)

    logger.info(f"Predicted {len(filtered_players)} players successfully.")
    return filtered_players
