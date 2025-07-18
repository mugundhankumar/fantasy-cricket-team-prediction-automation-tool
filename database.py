from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy import Column, String, Integer, Float, Date, ForeignKey, Index
from sqlalchemy import text
import asyncio

from config import DATABASE_URL

# Database configuration with connection pooling and retry logic
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    future=True,
    pool_size=30,
    max_overflow=0,
    pool_timeout=30,  # 30 seconds timeout
    pool_recycle=1800,  # Recycle connections after 30 minutes
    pool_pre_ping=True,  # Enable connection health checks
    connect_args={"check_same_thread": False}  # Required for SQLite
)

# Create session factory
async_session = sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
    autoflush=False  # Prevent auto-flushing for better control
)
AsyncSessionLocal = async_session

Base = declarative_base()

# Database connection context manager
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_db_session():
    session = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise
    finally:
        await session.close()

class Match(Base):
    __tablename__ = "matches"
    id = Column(String, primary_key=True, index=True)
    team1 = Column(String, index=True)
    team2 = Column(String, index=True)
    date = Column(Date, index=True)
    winner = Column(String, nullable=True)

    performances = relationship("MatchPerformance", back_populates="match")

    __table_args__ = (
        Index("idx_matches_team1", "team1"),
        Index("idx_matches_team2", "team2"),
        Index("idx_matches_date", "date"),
    )

class Player(Base):
    __tablename__ = "players"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    team = Column(String, index=True)
    batting_average = Column(Float, nullable=True)
    bowling_average = Column(Float, nullable=True)

    performances = relationship("MatchPerformance", back_populates="player")

    __table_args__ = (
        Index("idx_players_team", "team"),
    )

class MatchPerformance(Base):
    __tablename__ = "match_performances"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    match_id = Column(String, ForeignKey("matches.id"))
    player_id = Column(String, ForeignKey("players.id"))
    runs_scored = Column(Integer, default=0)
    wickets_taken = Column(Integer, default=0)
    catches = Column(Integer, default=0)

    match = relationship("Match", back_populates="performances")
    player = relationship("Player", back_populates="performances")

    __table_args__ = (
        Index("idx_match_perf_match_id", "match_id"),
        Index("idx_match_perf_player_id", "player_id"),
    )

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    player_id = Column(String, ForeignKey("players.id"), index=True)
    predicted_score = Column(Float, nullable=False)
    ownership_percent = Column(Float, nullable=True)
    mindset = Column(String, nullable=True)

    player = relationship("Player")

    __table_args__ = (
        Index("idx_predictions_player_id", "player_id"),
    )

async def health_check():
    max_retries = 3
    retry_delay = 1  # seconds
    
    for attempt in range(max_retries):
        try:
            async with engine.connect() as conn:
                result = await conn.execute(text("SELECT 1"))
                if result.scalar() == 1:
                    return {
                        "status": "healthy",
                        "database": "connected",
                        "pool_size": engine.pool.size(),
                        "connections_in_use": engine.pool.checkedin()
                    }
            
        except Exception as e:
            if attempt == max_retries - 1:  # Last attempt
                return {
                    "status": "error",
                    "error": str(e),
                    "database": "disconnected"
                }
            await asyncio.sleep(retry_delay)
    
    return {"status": "error", "database": "unreachable"}

async def close_db_connection():
    try:
        # Wait for any ongoing operations to complete
        await asyncio.sleep(0.1)
        
        # Close all connections in the pool
        await engine.dispose()
        
        return {"status": "success", "message": "Database connections closed successfully"}
    except Exception as e:
        return {
            "status": "error",
            "message": "Error closing database connections",
            "error": str(e)
        }
