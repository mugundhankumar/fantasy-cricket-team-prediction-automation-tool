import asyncio
from sqlalchemy import Index
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.sql import text
from database import Base, Match, Player, MatchPerformance, DATABASE_URL, AsyncSessionLocal

async def run_migration():
    # Create an asynchronous engine for the migration
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        try:
            # Create tables if they don't exist
            await conn.run_sync(Base.metadata.create_all)
            
            # Create new indexes if not exist
            indexes = await conn.execute(text("PRAGMA index_list('matches')"))
            existing_indexes = [row[1] for row in indexes.fetchall()]
            if 'ix_matches_team1' not in existing_indexes:
                await conn.run_sync(Index('ix_matches_team1', Match.team1).create)
            if 'ix_matches_team2' not in existing_indexes:
                await conn.run_sync(Index('ix_matches_team2', Match.team2).create)
            if 'ix_matches_date' not in existing_indexes:
                await conn.run_sync(Index('ix_matches_date', Match.date).create)

            indexes = await conn.execute(text("PRAGMA index_list('players')"))
            existing_indexes = [row[1] for row in indexes.fetchall()]
            if 'ix_players_team' not in existing_indexes:
                await conn.run_sync(Index('ix_players_team', Player.team).create)

            indexes = await conn.execute(text("PRAGMA index_list('match_performances')"))
            existing_indexes = [row[1] for row in indexes.fetchall()]
            if 'ix_match_performances_match_player' not in existing_indexes:
                await conn.run_sync(Index('ix_match_performances_match_player', MatchPerformance.match_id, MatchPerformance.player_id).create)

            print("✅ Indexes created successfully!")

            # Add 'winner' column to matches table if it does not exist
            result = await conn.execute(text("PRAGMA table_info('matches')"))
            columns = [row[1] for row in result.fetchall()]
            if 'winner' not in columns:
                print("Adding 'winner' column to matches table...")
                await conn.execute(text("ALTER TABLE matches ADD COLUMN winner TEXT"))
                print("✅ 'winner' column added to matches table.")
            else:
                print("'winner' column already exists in matches table.")

            # Verify the indexes were created
            async with AsyncSessionLocal() as session:
                for table, index in [
                    ('matches', 'ix_matches_team1'),
                    ('matches', 'ix_matches_team2'),
                    ('matches', 'ix_matches_date'),
                    ('players', 'ix_players_team'),
                    ('match_performances', 'ix_match_performances_match_player')
                ]:
                    result = await session.execute(text(f"SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND tbl_name='{table}' AND name='{index}'"))
                    count = result.scalar()
                    if count > 0:
                        print(f"✅ Index {index} on table {table} verified.")
                    else:
                        print(f"❌ Index {index} on table {table} not found!")

            print("✅ Migration completed successfully!")
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            raise

async def reverse_migration():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        try:
            # Drop the indexes
            await conn.execute(text("DROP INDEX IF EXISTS ix_matches_team1"))
            await conn.execute(text("DROP INDEX IF EXISTS ix_matches_team2"))
            await conn.execute(text("DROP INDEX IF EXISTS ix_matches_date"))
            await conn.execute(text("DROP INDEX IF EXISTS ix_players_team"))
            await conn.execute(text("DROP INDEX IF EXISTS ix_match_performances_match_player"))

            print("✅ Indexes dropped successfully!")
        except Exception as e:
            print(f"❌ Error during reverse migration: {e}")
            raise

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'reverse':
        asyncio.run(reverse_migration())
    else:
        asyncio.run(run_migration())