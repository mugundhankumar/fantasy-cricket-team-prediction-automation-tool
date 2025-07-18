import React, { useState, useEffect, useCallback } from 'react';
import PredictionDisplay from './PredictionDisplay';
import apiService from '../services/api';

const Home = () => {
  /* -------------------------------------------------------------------- */
  /*                         State & Config                               */
  /* -------------------------------------------------------------------- */
  const [matches,          setMatches]          = useState([]);
  const [matchId,          setMatchId]          = useState('');
  const [loading,          setLoading]          = useState(false);
  const [error,           setError]            = useState(null);

  const [selectedMatch,    setSelectedMatch]    = useState(null);
  const [team1Players,     setTeam1Players]     = useState([]);
  const [team2Players,     setTeam2Players]     = useState([]);

  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/matches`);
        if (!response.ok) throw new Error('Failed to fetch matches');
        const data = await response.json();
        setMatches(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [BACKEND_URL]);
  const [winnerTeam,       setWinnerTeam]       = useState('');   // default = team1

  const [maxCombos]        = useState(5);                         // you can expose this if you like
  const [predictedTeams,   setPredictedTeams]   = useState([]);

  /* feedback */
  const [connectionState,  setConnectionState]  = useState('checking'); // checking | testing | connected | disconnected

  /* -------------------------------------------------------------------- */
  /*                    Backend Connection Management                      */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        await apiService.getMatches(); // This will throw if backend is unreachable
        setConnectionState('connected');
      } catch (error) {
        setConnectionState('disconnected');
        setError('Backend server is not responding. Please try again later.');
      }
    };
    
    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------------------- */
  /*                1️⃣  Load matches on first render                      */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const data = await apiService.getMatches();
        setMatches(data);
      } catch (err) {
        setError(`Failed to load matches: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  /* -------------------------------------------------------------------- */
  /*          2️⃣  When a match is picked, fetch its squads                */
  /* -------------------------------------------------------------------- */
  const loadSquads = useCallback(async () => {
    if (!matchId) return;

    setError(null);
    try {
      setLoading(true);
      const data = await apiService.getMatchSquads(matchId);
      setTeam1Players(data.team1_players || []);
      setTeam2Players(data.team2_players || []);
      const m = matches.find(m => m.id === matchId);
      setSelectedMatch(m);
      setWinnerTeam(m?.team1 || '');
    } catch (err) {
      setError(`Failed to load squads: ${err.message}`);
      setTeam1Players([]);
      setTeam2Players([]);
    } finally {
      setLoading(false);
    }
  }, [matchId, matches]);

  useEffect(() => {
    loadSquads();
  }, [loadSquads]);

  /* -------------------------------------------------------------------- */
  /*                    3️⃣  Submit – get prediction                       */
  /* -------------------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!matchId) return setError('Select a match first');
    if (team1Players.length === 0 || team2Players.length === 0)
      return setError('Squad lists are empty');
    if (!selectedMatch) return setError('Match details not found');

    setError(null);
    setPredictedTeams([]);
    setLoading(true);

    try {
      // Update data before prediction
      await apiService.updateData();

      const predictData = {
        match_id: matchId,
        team1: selectedMatch.team1,
        team2: selectedMatch.team2,
        team1_players: team1Players,
        team2_players: team2Players,
        winner_team: winnerTeam,
        max_combinations: maxCombos,
      };

      const response = await apiService.predictTeam(predictData);
      setPredictedTeams(response.teams || []);
    } catch (err) {
      setError(`Prediction failed: ${err.message}`);
      setPredictedTeams([]);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------- */
  /*                            Render                                     */
  /* -------------------------------------------------------------------- */

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>🏏 GL Genie – Quick Predictor</h1>

      {/* connection banner */}
      <p style={{ textAlign: 'center', color: connectionState === 'connected' ? 'green' : '#d9534f' }}>
        {connectionState === 'checking' && '🔄 Checking backend…'}
        {connectionState === 'testing'   && '🔍 Finding backend…'}
        {connectionState === 'connected' && '✅ Backend connected'}
        {connectionState === 'disconnected' && '❌ Backend not found on port 8000'}
      </p>

      {/* error */}
      {error && (
        <div style={{ background: '#f8d7da', padding: 12, borderRadius: 6, margin: '1rem 0' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <label htmlFor="match">Select Match:</label>
        <select
          id="match"
          value={matchId}
          onChange={e => setMatchId(e.target.value)}
          style={{ marginLeft: 8, padding: 6 }}
        >
          <option value="">-- choose --</option>
          {matches.map(m => (
            <option key={m.id} value={m.id}>
              {m.team1} vs {m.team2} ({m.date})
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!matchId || loading}
          style={{ marginLeft: 16, padding: '6px 18px' }}
        >
          {loading ? 'Predicting…' : 'Predict'}
        </button>
      </form>

      {predictedTeams.length > 0 && (
        <PredictionDisplay teams={predictedTeams} />
      )}
    </div>
  );
};

export default Home;
