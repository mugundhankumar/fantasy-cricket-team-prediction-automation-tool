import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Trophy, Users, Zap, BarChart3 } from 'lucide-react';
import PredictionDisplay from './PredictionDisplay';

const GLGenieDashboard = () => {
  const [matches, setMatches] = useState([]);
  const [generatedTeams, setGeneratedTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/matches`);
        if (!res.ok) throw new Error('Failed to fetch matches');
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchMatches();
  }, [BACKEND_URL]);

  const handleGenerateTeams = async () => {
    if (matches.length === 0) {
      setError('No matches available to generate teams');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const matchId = matches[0].id || matches[0].match_id || '';
      const response = await fetch(`${BACKEND_URL}/api/predict_team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: matchId }),
      });
      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const data = await response.json();
      if (data.teams) {
        setGeneratedTeams(data.teams);
      } else {
        setError('No teams returned from API');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate teams');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-black/20 backdrop-blur-xl rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white flex items-center text-lg font-semibold">
            <Calendar className="mr-2 h-5 w-5 text-violet-400" />
            Match Center
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.length === 0 ? (
            <p className="text-gray-400">No matches available</p>
          ) : (
            matches.map((match) => (
              <div
                key={match.id}
                className="border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer rounded p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{match.team1Logo || '🏏'}</div>
                    <span className="text-white font-semibold">{match.team1}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-white font-semibold">{match.team2}</span>
                    <div className="text-2xl">{match.team2Logo || '🏏'}</div>
                  </div>
                  <span className="border border-violet-400 text-violet-400 px-2 py-0.5 rounded">
                    {match.time}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {match.venue}
                  </div>
                  <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded">{match.pitch}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-black/20 backdrop-blur-xl rounded-lg p-4 border border-white/10 space-y-4">
        <h2 className="text-white flex items-center text-lg font-semibold">
          <Users className="mr-2 h-5 w-5 text-green-400" />
          Team Generator
        </h2>
        <div className="flex justify-center">
          <button
            onClick={handleGenerateTeams}
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="mr-2 h-5 w-5 inline-block" />
            {loading ? 'Generating...' : 'Generate Teams'}
          </button>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </section>

      <section className="bg-black/20 backdrop-blur-xl rounded-lg p-4 border border-white/10">
        <h2 className="text-white flex items-center text-lg font-semibold mb-4">
          <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
          Generated Teams
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {generatedTeams.length === 0 ? (
            <p className="text-gray-400">No teams generated yet</p>
          ) : (
            <PredictionDisplay teams={generatedTeams} />
          )}
        </div>
      </section>

      <section className="bg-black/20 backdrop-blur-xl rounded-lg p-4 border border-white/10">
        <h2 className="text-white flex items-center text-lg font-semibold mb-4">
          <BarChart3 className="mr-2 h-5 w-5 text-blue-400" />
          Player Statistics
        </h2>
        <div>
          <p className="text-gray-400 text-center py-8">Player statistics will be displayed here</p>
        </div>
      </section>
    </div>
  );
};

export default GLGenieDashboard;
