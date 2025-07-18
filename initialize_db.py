import sqlite3
import os

# Ensure the backend directory exists
os.makedirs("backend", exist_ok=True)

# Connect to the database in the backend directory
conn = sqlite3.connect("backend/glgenie.db")
cursor = conn.cursor()

# Drop tables if they already exist (optional for testing)
cursor.execute("DROP TABLE IF EXISTS players")
cursor.execute("DROP TABLE IF EXISTS matches")
cursor.execute("DROP TABLE IF EXISTS predictions")

# Create players table
cursor.execute("""
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    team TEXT NOT NULL,
    credits REAL NOT NULL,
    points REAL DEFAULT 0.0
)
""")

# Create matches table
cursor.execute("""
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT NOT NULL,
    team1 TEXT NOT NULL,
    team2 TEXT NOT NULL,
    venue TEXT,
    date TEXT
)
""")

# Create predictions table
cursor.execute("""
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    predicted_score REAL,
    ownership_percent REAL,
    mindset TEXT,
    FOREIGN KEY(player_id) REFERENCES players(id)
)
""")

# Insert sample players
players = [
    ("Virat Kohli", "batsman", "RCB", 10.5),
    ("MS Dhoni", "keeper", "CSK", 9.0),
    ("Rashid Khan", "bowler", "GT", 9.5),
    ("Hardik Pandya", "allrounder", "MI", 10.0),
]
for p in players:
    cursor.execute("INSERT INTO players (name, role, team, credits) VALUES (?, ?, ?, ?)", p)

# Insert sample matches
matches = [
    ("MATCH001", "RCB", "CSK", "Chinnaswamy Stadium", "2025-06-20"),
    ("MATCH002", "MI", "GT", "Wankhede Stadium", "2025-06-21"),
]
for m in matches:
    cursor.execute("INSERT INTO matches (match_id, team1, team2, venue, date) VALUES (?, ?, ?, ?, ?)", m)

# Commit and close
conn.commit()
conn.close()

print("Database backend/glgenie.db initialized and filled with sample data.")