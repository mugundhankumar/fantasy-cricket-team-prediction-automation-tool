import React from 'react';
import { Calendar, Clock, TrendingUp, Users, BarChart2, Trophy, Cpu, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import PredictionDisplay from './PredictionDisplay';

const OverviewDashboard = () => {
  // Placeholder data, to be replaced with API calls using React Query or Axios
  const liveMatches = [
    { id: 1, match: 'Team A vs Team B', format: 'T20', status: 'Live' },
    { id: 2, match: 'Team C vs Team D', format: 'ODI', status: 'Upcoming' },
  ];

  const summary = {
    totalTeamsGenerated: 1200,
    winningPercentage: 78,
    autoGenerationStatus: 'Active',
  };

  const recentMatchPrediction = {
    match: 'Team A vs Team B',
    confidenceScore: 85,
    keyPlayers: ['Player 1', 'Player 2', 'Player 3'],
    accuracy: 92,
  };

  const mindsetSummary = {
    aggressive: 40,
    safe: 35,
    balanced: 25,
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-white">
      {/* Live Match Notification Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <span>Live Match Notifications</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {liveMatches.map(({ id, match, format, status }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: id * 0.1 }}
              className={`p-4 rounded-lg shadow-md border border-white/20 ${
                status === 'Live' ? 'bg-red-700 text-white' : 'bg-gray-900'
              } backdrop-blur-md`}
            >
              <h3 className="font-bold text-lg">{match}</h3>
              <p className="text-sm">Format: {format}</p>
              <p className="text-sm font-semibold">{status}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center p-4 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-lg shadow-lg backdrop-blur-md">
          <Users className="h-8 w-8 mr-4 text-white" />
          <div>
            <p className="text-sm">Total Teams Generated</p>
            <p className="text-2xl font-bold">{summary.totalTeamsGenerated}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-gradient-to-r from-green-700 to-teal-700 rounded-lg shadow-lg backdrop-blur-md">
          <TrendingUp className="h-8 w-8 mr-4 text-white" />
          <div>
            <p className="text-sm">Winning %</p>
            <p className="text-2xl font-bold">{summary.winningPercentage}%</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg shadow-lg backdrop-blur-md">
          <Cpu className="h-8 w-8 mr-4 text-white" />
          <div>
            <p className="text-sm">Auto-Generation Status</p>
            <p className="text-2xl font-bold">{summary.autoGenerationStatus}</p>
          </div>
        </div>
      </section>

      {/* Interactive Charts Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-lg p-4 shadow-lg backdrop-blur-md">
          <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
            <BarChart2 className="w-5 h-5" />
            <span>Fantasy Points Trends</span>
          </h3>
          <div className="h-40 bg-gray-800 rounded" style={{color: 'white'}}>
            {/* Placeholder for line/area chart */}
            <p className="text-center pt-16 text-gray-400">Chart Placeholder</p>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 shadow-lg backdrop-blur-md">
          <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
            <BarChart2 className="w-5 h-5" />
            <span>Player Performance Graph</span>
          </h3>
          <div className="h-40 bg-gray-800 rounded">
            <p className="text-center pt-16 text-gray-400">Chart Placeholder</p>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 shadow-lg backdrop-blur-md">
          <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Ownership % Pie Chart</span>
          </h3>
          <div className="h-40 bg-gray-800 rounded">
            <p className="text-center pt-16 text-gray-400">Chart Placeholder</p>
          </div>
        </div>
      </section>

      {/* AI-powered Captain & Vice-Captain Suggestions */}
      <section className="bg-gray-900 rounded-lg p-6 shadow-lg backdrop-blur-md">
        <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
          <Cpu className="w-6 h-6 text-indigo-400" />
          <span>AI-powered Captain & Vice-Captain Suggestions</span>
        </h2>
        <p>Key Players: Player 1, Player 2, Player 3</p>
      </section>

      {/* Mindset Classification Summary */}
      <section className="bg-gray-900 rounded-lg p-6 shadow-lg backdrop-blur-md">
        <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <span>Mindset Classification Summary</span>
        </h2>
        <ul className="list-disc list-inside">
          <li>Aggressive: 40%</li>
          <li>Safe: 35%</li>
          <li>Balanced: 25%</li>
        </ul>
      </section>

      {/* Recent Match Prediction Accuracy */}
      <section className="bg-gray-900 rounded-lg p-6 shadow-lg backdrop-blur-md">
        <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
          <Clock className="w-6 h-6 text-yellow-400" />
          <span>Recent Match Prediction Accuracy</span>
        </h2>
        <p>Match: {recentMatchPrediction.match}</p>
        <p>Confidence Score: {recentMatchPrediction.confidenceScore}%</p>
        <p>Accuracy: {recentMatchPrediction.accuracy}%</p>
      </section>
    </div>
  );
};

export default OverviewDashboard;
