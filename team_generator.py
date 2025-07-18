import random

def generate_team(ranked_players, winner_team, team1, team2, team1_players, team2_players, max_combinations=5):
    all_teams = []
    winner_list = team1_players if winner_team == team1 else team2_players
    loser_list = team2_players if winner_team == team1 else team1_players
    winner_pool = [p for p in ranked_players if p['player'] in winner_list]
    loser_pool = [p for p in ranked_players if p['player'] in loser_list]
    for _ in range(max_combinations):
        team = random.sample(winner_pool, 8) + random.sample(loser_pool, 3)
        team = sorted(team, key=lambda x: x['score'], reverse=True)
        captain = team[0]['player']
        vice_captain = team[1]['player']
        all_teams.append({
            "players": [p['player'] for p in team],
            "captain": captain,
            "vice_captain": vice_captain
        })
    return all_teams
