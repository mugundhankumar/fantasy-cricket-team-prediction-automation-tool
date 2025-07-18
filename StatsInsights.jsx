import React from 'react';
import { Table, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const playerStatsData = [
  { name: 'Player 1', runs: 450, wickets: 12, avg: 45.0, points: 1200 },
  { name: 'Player 2', runs: 380, wickets: 8, avg: 38.0, points: 1100 },
  { name: 'Player 3', runs: 500, wickets: 15, avg: 50.0, points: 1300 },
];

const teamH2HData = [
  { team1: 'Team A', team2: 'Team B', wins: 5, losses: 3 },
  { team1: 'Team C', team2: 'Team D', wins: 2, losses: 6 },
];

const StatsInsights = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-semibold mb-6">Stats & Insights</h1>

      {/* Player Stats Board */}
      <section className="bg-gray-900 rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Player Stats Board</h2>
        <table className="w-full text-left text-sm text-gray-300">
          <thead>
            <tr>
              <th className="border-b border-gray-700 p-2">Player</th>
              <th className="border-b border-gray-700 p-2">Runs</th>
              <th className="border-b border-gray-700 p-2">Wickets</th>
              <th className="border-b border-gray-700 p-2">Avg.</th>
              <th className="border-b border-gray-700 p-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {playerStatsData.map((player, idx) => (
              <tr key={idx} className="hover:bg-gray-800">
                <td className="p-2">{player.name}</td>
                <td className="p-2">{player.runs}</td>
                <td className="p-2">{player.wickets}</td>
                <td className="p-2">{player.avg}</td>
                <td className="p-2">{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Team vs Team H2H Table */}
      <section className="bg-gray-900 rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Team vs Team H2H</h2>
        <table className="w-full text-left text-sm text-gray-300">
          <thead>
            <tr>
              <th className="border-b border-gray-700 p-2">Team 1</th>
              <th className="border-b border-gray-700 p-2">Team 2</th>
              <th className="border-b border-gray-700 p-2">Wins</th>
              <th className="border-b border-gray-700 p-2">Losses</th>
            </tr>
          </thead>
          <tbody>
            {teamH2HData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-800">
                <td className="p-2">{row.team1}</td>
                <td className="p-2">{row.team2}</td>
                <td className="p-2">{row.wins}</td>
                <td className="p-2">{row.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Pitch & Venue Analytics */}
      <section className="bg-gray-900 rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Pitch & Venue Analytics</h2>
        <p className="text-gray-400">Analytics charts will be displayed here.</p>
      </section>

      {/* Fantasy Ownership Predictor Output */}
      <section className="bg-gray-900 rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Fantasy Ownership Predictor</h2>
        <p className="text-gray-400">Predictor output will be displayed here.</p>
      </section>

      {/* Mindset Classifier */}
      <section className="bg-gray-900 rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Mindset Classifier</h2>
        <p className="text-gray-400">Conservative, Aggressive, Punt classification here.</p>
      </section>
    </div>
  );
};

export default StatsInsights;
