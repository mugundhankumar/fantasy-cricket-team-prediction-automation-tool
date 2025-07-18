import csv
import os

def export_team_csv(team_list, match_id):
    os.makedirs("exports", exist_ok=True)
    filename = f"exports/GL_Genie_Teams_{match_id}.csv"
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Team No", "Players", "Captain", "Vice-Captain"])
        for idx, team in enumerate(team_list, start=1):
            writer.writerow([
                idx,
                ", ".join(team['players']),
                team['captain'],
                team['vice_captain']
            ])
    return filename
