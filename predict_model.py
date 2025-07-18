from pathlib import Path
import os
import logging
from itertools import combinations
from typing import List, Dict, Any, Optional
from collections.abc import AsyncGenerator

# Third-party imports
import httpx
from pydantic import BaseModel, Field, validator
from fastapi import HTTPException
import joblib
import pandas as pd
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from tenacity import retry, stop_after_attempt, wait_exponential, RetryError
from dotenv import load_dotenv

# Local imports - using absolute imports
try:
    from backend.app.config import get_settings
    from backend.app.models.player import Player, PlayerStats
    from backend.app.models.team import Team
    from backend.db.database import AsyncSessionLocal
    from backend.app.services.cricket_api import CricketAPI
except ImportError as e:
    raise ImportError(f"Failed to import required modules. Make sure backend package is in PYTHONPATH: {e}")

# Load environment variables
load_dotenv()

# Configure logging once
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Application settings and configuration
try:
    settings = get_settings()
except Exception as e:
    logger.error(f"Failed to load settings: {e}")
    raise RuntimeError(f"Configuration error: {e}")

# API Constants
RETRY_ATTEMPTS = 3
MIN_WAIT_SECONDS = 1
MAX_WAIT_SECONDS = 10

# Model Configuration
REQUIRED_FEATURES = [
    'bat_avg', 'bat_sr', 'bowl_avg', 'bowl_sr', 'death_overs_pct'
]

DEFAULT_FEATURES = {
    'bat_avg': 25.0,
    'bat_sr': 120.0,
    'bowl_avg': 30.0,
    'bowl_sr': 25.0,
    'death_overs_pct': 0.3
}

# Validate ML model path
ML_MODEL_PATH = settings.ML_MODEL_PATH
if not Path(ML_MODEL_PATH).exists():
    logger.error(f"ML model not found at {ML_MODEL_PATH}")
    raise RuntimeError(f"ML model file missing: {ML_MODEL_PATH}")

# Initialize Cricket API client
try:
    cricket_api = CricketAPI()
except Exception as e:
    logger.error(f"Failed to initialize Cricket API client: {e}")
    raise RuntimeError(f"API client initialization error: {e}")

# --- Custom Exceptions ---
class MLModelError(Exception):
    """Base exception for ML model errors"""
    pass

class PredictionError(Exception):
    """Exception for prediction errors"""
    pass

class ValidationError(Exception):
    """Exception for data validation errors"""
    pass

# --- Models ---
class PlayerStats(BaseModel):
    """Player statistics model with validation"""
    bat_avg: float = Field(default=DEFAULT_FEATURES['bat_avg'], ge=0)
    bat_sr: float = Field(default=DEFAULT_FEATURES['bat_sr'], ge=0)
    bowl_avg: float = Field(default=DEFAULT_FEATURES['bowl_avg'], ge=0)
    bowl_sr: float = Field(default=DEFAULT_FEATURES['bowl_sr'], ge=0)
    death_overs_pct: float = Field(default=DEFAULT_FEATURES['death_overs_pct'], ge=0, le=1)

    @validator('*')
    def validate_stats(cls, v, field):
        if v < 0:
            raise ValueError(f"{field.name} cannot be negative")
        return v

    class Config:
        json_schema_extra = {
            "example": DEFAULT_FEATURES
        }

class Player(BaseModel):
    """Player model with enhanced validation"""
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    team: str = Field(..., min_length=1)
    role: str = Field(..., min_length=1)
    stats: PlayerStats
    fantasy_points: float = Field(default=0.0, ge=0)
    confidence: float = Field(default=0.8, ge=0, le=1)

    @validator('fantasy_points', 'confidence')
    def validate_metrics(cls, v, field):
        if field.name == 'confidence' and not (0 <= v <= 1):
            raise ValueError("Confidence must be between 0 and 1")
        if v < 0:
            raise ValueError(f"{field.name} cannot be negative")
        return round(v, 3)  # Round to 3 decimal places

class Team(BaseModel):
    """Team model with enhanced validation"""
    captain: str = Field(..., min_length=1)
    vice_captain: str = Field(..., min_length=1)
    players: List[str] = Field(..., min_items=11, max_items=11)
    total_points: float = Field(default=0.0, ge=0)

    @validator('players')
    def validate_team_size(cls, v):
        if len(set(v)) != len(v):
            raise ValueError("Duplicate players not allowed")
        return v

    @validator('vice_captain')
    def validate_different_captain(cls, v, values):
        if 'captain' in values and v == values['captain']:
            raise ValueError("Captain and vice-captain must be different players")
        return v

class MLModelWrapper:
    """Wrapper for ML model with enhanced error handling and validation"""
    _instance = None
    _model = None
    
    def __init__(self):
        """Initialize with model path validation"""
        if not os.path.exists(ML_MODEL_PATH):
            raise MLModelError(f"Model file not found: {ML_MODEL_PATH}")
    
    @classmethod
    def get_instance(cls) -> 'MLModelWrapper':
        """Get singleton instance with proper error handling"""
        if cls._instance is None:
            try:
                cls._instance = cls()
            except Exception as e:
                logger.error(f"Failed to create MLModelWrapper instance: {e}")
                raise MLModelError(f"Model initialization failed: {e}")
        return cls._instance
    
    def load_model(self):
        """Load and validate ML model with comprehensive error handling"""
        if self._model is None:
            try:
                self._model = joblib.load(ML_MODEL_PATH)
                
                # Validate model interface
                required_methods = ['predict', 'fit']
                missing_methods = [method for method in required_methods 
                                 if not hasattr(self._model, method)]
                if missing_methods:
                    raise MLModelError(f"Model missing required methods: {missing_methods}")
                
                # Validate model type
                if not hasattr(self._model, 'feature_names_in_'):
                    logger.warning("Model doesn't have feature_names_in_ attribute")
                
                logger.info(f"ML model loaded and validated successfully from {ML_MODEL_PATH}")
            except (OSError, IOError) as e:
                logger.error(f"IO error loading model: {e}")
                raise MLModelError(f"Failed to read model file: {e}")
            except Exception as e:
                logger.error(f"Unexpected error loading model: {e}")
                raise MLModelError(f"Model loading failed: {e}")
        return self._model
    
    @retry(
        stop=stop_after_attempt(RETRY_ATTEMPTS),
        wait=wait_exponential(multiplier=MIN_WAIT_SECONDS, max=MAX_WAIT_SECONDS),
        reraise=True
    )
    def predict(self, features: pd.DataFrame) -> np.ndarray:
        """Make predictions with enhanced validation and retry logic"""
        try:
            model = self.load_model()
            
            # Validate input features
            if not isinstance(features, pd.DataFrame):
                raise ValueError("Features must be a pandas DataFrame")
            
            missing_features = set(REQUIRED_FEATURES) - set(features.columns)
            if missing_features:
                raise ValueError(f"Missing required features: {missing_features}")
            
            # Validate feature values
            if features.isnull().any().any():
                raise ValueError("Features contain null values")
            
            if (features < 0).any().any():
                raise ValueError("Features contain negative values")
            
            # Ensure correct feature order and types
            features = features[REQUIRED_FEATURES].astype(float)
            
            # Make prediction
            predictions = model.predict(features)
            
            # Validate predictions
            if not isinstance(predictions, np.ndarray):
                raise PredictionError("Model did not return numpy array")
            
            if len(predictions) != len(features):
                raise PredictionError("Prediction length mismatch")
            
            return predictions
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise PredictionError(f"Failed to make prediction: {str(e)}")
            
    def validate_features(self, features: pd.DataFrame) -> None:
        """Validate feature DataFrame"""
        if features.empty:
            raise ValidationError("Empty feature DataFrame")
            
        for feature in REQUIRED_FEATURES:
            if feature not in features.columns:
                raise ValidationError(f"Missing feature: {feature}")
            
            if not pd.api.types.is_numeric_dtype(features[feature]):
                raise ValidationError(f"Feature {feature} must be numeric")

# --- Core Logic for Player Prediction ---
async def predict_top_players(
    match_id: str,
    combined_players: Optional[List[str]] = None,
    session: Optional[AsyncSession] = None
) -> List[Player]:
    """
    Predicts player performance for a match using ML model and cricket data API.
    
    Args:
        match_id: The unique identifier for the match
        combined_players: Optional list of player names to use as fallback
        session: Optional database session for caching results
        
    Returns:
        List[Player]: Sorted list of players with their predicted fantasy points
        
    Raises:
        HTTPException: For API or service errors
        MLModelError: For model-related errors
        PredictionError: For prediction-related errors
        ValidationError: For data validation errors
    """
    # Input validation
    if not match_id or not isinstance(match_id, str):
        raise ValidationError("Invalid match_id")
        
    if combined_players is not None and not all(isinstance(p, str) for p in combined_players):
        raise ValidationError("combined_players must be a list of strings")
    logger.info(f"Predicting top players for match_id: {match_id}. Total players in input: {len(combined_players)}")

    logger.info(f"Starting prediction for match_id: {match_id}")
    
    if not match_id:
        raise ValueError("match_id cannot be empty")
    
    # Check cache first if session provided
    if session:
        try:
            cached_predictions = await get_cached_predictions(match_id, session)
            if cached_predictions:
                logger.info(f"Using cached predictions for match {match_id}")
                return cached_predictions
        except Exception as e:
            logger.warning(f"Failed to get cached predictions: {e}")

    # Initialize ML model
    try:
        ml_model = MLModelWrapper.get_instance()
    except MLModelError as e:
        logger.error(f"Failed to initialize ML model: {e}")
        raise PredictionError(f"Model initialization failed: {str(e)}")
    
    # 1. Fetch match data
    async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
        try:
            response = await client.get(
                config.API_URL_MATCH_INFO,
                params={
                    "apikey": config.CRICKET_API_KEY,
                    "id": match_id
                }
            )
            response.raise_for_status()
            cricket_data = response.json()
            
            if not cricket_data.get('data'):
                raise ValidationError("No data in API response")
                
        except httpx.TimeoutException as e:
            logger.error(f"Timeout while fetching match data for {match_id}: {e}")
            raise PredictionError("Cricket data service timeout. Please try again later.")
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP {e.response.status_code} error: {e.response.text}")
            if e.response.status_code == 404:
                raise ValidationError(f"Match {match_id} not found")
            elif e.response.status_code == 401:
                raise PredictionError("Invalid API credentials")
            else:
                raise PredictionError(f"Cricket data service error: {str(e)}")
                
        except Exception as e:
            logger.error(f"Error fetching match data: {e}")
            raise PredictionError("Failed to fetch match data")

    async def process_player_data(player: Dict[str, Any], team_name: str) -> Optional[Dict[str, Any]]:
    try:
        # Validate required player fields
        if not player.get('id') or not player.get('name'):
            raise ValidationError(f"Missing required fields for player in team {team_name}")

        # Create player with validated stats
        stats = PlayerStats(
            bat_avg=float(player.get('batting_average', DEFAULT_FEATURES['bat_avg'])),
            bat_sr=float(player.get('strike_rate', DEFAULT_FEATURES['bat_sr'])),
            bowl_avg=float(player.get('bowling_average', DEFAULT_FEATURES['bowl_avg'])),
            bowl_sr=float(player.get('bowling_strike_rate', DEFAULT_FEATURES['bowl_sr'])),
            death_overs_pct=float(player.get('death_overs_percentage', DEFAULT_FEATURES['death_overs_pct']))
        )
        
        return {
            'id': str(player.get('id')),
            'name': str(player.get('name')),
            'team': team_name,
            'role': str(player.get('role', 'Unknown')),
            'stats': stats
        }
    except (ValueError, TypeError) as e:
        logger.warning(f"Error processing player {player.get('name', 'unknown')}: {e}")
    except ValidationError as e:
        logger.warning(f"Validation error for player {player.get('name', 'unknown')}: {e}")
    return None

# Process match data and extract players
try:
    match_data = cricket_data.get('data', {})
    players_data = []
    
    # Extract players from squads
    for team in match_data.get('teams', []):
        team_name = team.get('name', 'Unknown')
        for player in team.get('players', []):
            processed_player = await process_player_data(player, team_name)
            if processed_player:
                players_data.append(processed_player)
        
        # Use fallback data if needed
        if not players_data and combined_players:
            logger.info("Using fallback player data")
            for name in combined_players:
                players_data.append({
                    'id': str(hash(name)),
                    'name': name,
                    'team': 'Unknown',
                    'role': 'Unknown',
                    'stats': PlayerStats()  # Uses default values
                })
        
        if not players_data:
            raise ValidationError("No valid player data available for prediction")

    # 2. Process player data
    match_data = cricket_data.get('data', {})
    players_data = []
    
    # Extract players from squads
    for team in match_data.get('teams', []):
        team_name = team.get('name', 'Unknown')
        for player in team.get('players', []):
            try:
                # Create player with validated stats
                stats = PlayerStats(
                    bat_avg=float(player.get('batting_average', config.DEFAULT_FEATURES['bat_avg'])),
                    bat_sr=float(player.get('strike_rate', config.DEFAULT_FEATURES['bat_sr'])),
                    bowl_avg=float(player.get('bowling_average', config.DEFAULT_FEATURES['bowl_avg'])),
                    bowl_sr=float(player.get('bowling_strike_rate', config.DEFAULT_FEATURES['bowl_sr'])),
                    death_overs_pct=float(player.get('death_overs_percentage', config.DEFAULT_FEATURES['death_overs_pct']))
                )
                
                players_data.append({
                    'id': str(player.get('id', '')),
                    'name': str(player.get('name', 'Unknown')),
                    'team': team_name,
                    'role': str(player.get('role', 'Unknown')),
                    'stats': stats
                })
            except (ValueError, TypeError) as e:
                logger.warning(f"Error processing player data: {e}")
    
    # Use fallback data if needed
    if not players_data and combined_players:
        logger.warning("Using fallback player data")
        for name in combined_players:
            players_data.append({
                'id': str(hash(name)),
                'name': name,
                'team': 'Unknown',
                'role': 'Unknown',
                'stats': PlayerStats()  # Uses default values
            })
    
    if not players_data:
        logger.error("No player data available for prediction")
        raise HTTPException(
            status_code=404,
            detail="No player data available for prediction"
        )

        # Prepare features and make predictions
        try:
            # Create features DataFrame
            features_df = pd.DataFrame([
                {
                    'bat_avg': p['stats'].bat_avg,
                    'bat_sr': p['stats'].bat_sr,
                    'bowl_avg': p['stats'].bowl_avg,
                    'bowl_sr': p['stats'].bowl_sr,
                    'death_overs_pct': p['stats'].death_overs_pct
                }
                for p in players_data
            ])

            # Validate features before prediction
            for feature in REQUIRED_FEATURES:
                if feature not in features_df.columns:
                    raise ValidationError(f"Missing required feature: {feature}")
                
            if features_df.isnull().any().any():
                logger.warning("Features contain null values, filling with defaults")
                features_df = features_df.fillna(DEFAULT_FEATURES)
            
            # Make predictions with retries
            prediction_errors = []
            for attempt in range(RETRY_ATTEMPTS):
                try:
                    predictions = ml_model.predict(features_df)
                    break
                except MLModelError as e:
                    if attempt == RETRY_ATTEMPTS - 1:
                        raise PredictionError(f"All prediction attempts failed: {str(e)}")
                    logger.warning(f"Prediction attempt {attempt + 1} failed, retrying...")
                    await asyncio.sleep(1)  # Short delay between retries
            
            # Create Player objects with predictions
            players = []
            for idx, player_data in enumerate(players_data):
                try:
                    player = Player(
                        id=player_data['id'],
                        name=player_data['name'],
                        team=player_data['team'],
                        role=player_data['role'],
                        stats=player_data['stats'],
                        fantasy_points=float(predictions[idx]),
                        confidence=calculate_confidence_score(player_data)
                    )
                    players.append(player)
                except (ValueError, ValidationError) as e:
                    logger.warning(f"Error creating player object for {player_data['name']}: {e}")
                    prediction_errors.append(f"Failed to process {player_data['name']}: {str(e)}")
            
            if not players:
                raise PredictionError("Failed to create any valid player predictions")
            
            # Sort players by fantasy points
            players.sort(key=lambda x: x.fantasy_points, reverse=True)
            
            # Cache predictions if session provided
            if session:
                try:
                    await cache_predictions(match_id, players, session)
                except Exception as e:
                    logger.warning(f"Failed to cache predictions: {e}")
            
            logger.info(f"Successfully predicted performance for {len(players)} players")
            if prediction_errors:
                logger.warning(f"Encountered {len(prediction_errors)} errors during prediction")
            
            return players
            
        except ValidationError as e:
            logger.error(f"Validation error during prediction: {e}")
            raise ValidationError(f"Invalid data for prediction: {str(e)}")
        except MLModelError as e:
            logger.error(f"ML model error during prediction: {e}")
            raise PredictionError(f"Model prediction failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during prediction: {e}")
            raise PredictionError(f"Prediction failed: {str(e)}")

# --- Team Generation Logic ---
def validate_team_input(
    ranked_players: List[Player],
    winner_team: str,
    team1: str,
    team2: str,
    team1_players: List[str],
    team2_players: List[str]
) -> None:
    """Validates team generation inputs and raises appropriate exceptions."""
    if not ranked_players:
        raise ValueError("No ranked players provided")
    
    if not winner_team or winner_team not in [team1, team2]:
        raise ValueError(f"Winner team '{winner_team}' must be either '{team1}' or '{team2}'")
    
    if not team1_players or not team2_players:
        raise ValueError("Both teams must have players")
        
    all_players = set(p.name for p in ranked_players)
    unknown_team1 = set(team1_players) - all_players
    unknown_team2 = set(team2_players) - all_players
    
    if unknown_team1 or unknown_team2:
        raise ValueError(f"Unknown players found: {unknown_team1 | unknown_team2}")

def generate_team(
    ranked_players: List[Player],
    winner_team: str,
    team1: str,
    team2: str,
    team1_players: List[str],
    team2_players: List[str],
    max_combinations: int = 5
) -> List[Team]:
    """
    Generates fantasy teams based on ranked players, winner prediction, and team constraints.
    Includes input validation and enhanced error handling.
    """
    logger.info(f"Generating teams with {len(ranked_players)} ranked players.")
    
    try:
        validate_team_input(ranked_players, winner_team, team1, team2, team1_players, team2_players)

    if len(ranked_players) < 11:
        logger.warning(f"Not enough ranked players ({len(ranked_players)}) to form a full 11-player team. Returning empty list.")
        return [] 
    
    top_11_players = ranked_players[:11]
    top_11_player_names = [p.name for p in top_11_players]

    teams = []
    captain_candidates = top_11_players[:6]
    if len(captain_candidates) < 2:
        logger.warning("Insufficient captain candidates to form combinations (need at least 2). Returning empty list.")
        return [] 

    for captain, vice in combinations(captain_candidates, 2):
        if captain.name == vice.name:
            continue

        teams.append(Team(
            captain=captain.name,
            vice_captain=vice.name,
            players=top_11_player_names 
        ))
        if len(teams) >= max_combinations:
            logger.info(f"Reached maximum of {max_combinations} teams. Stopping generation.")
            break

    logger.info(f"Generated {len(teams)} teams.")
    return teams

# --- Dummy Export CSV (remains largely the same) ---
def export_team_csv(teams: List[Team], match_id: str):
    """
    Exports the generated teams to a CSV file.
    """
    logger.info(f"Exporting {len(teams)} teams for match {match_id} to CSV (dummy function).")
    pass

