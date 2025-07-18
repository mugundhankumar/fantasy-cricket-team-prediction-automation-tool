import React, { useState, useEffect } from 'react';
import PredictionDisplay from './PredictionDisplay';

const Home = () => {
  const [matches, setMatches] = useState([]);
  const [matchId, setMatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictedTeams, setPredictedTeams] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Backend URL from .env or fallback
  const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000',
    FALLBACK_URLS: [
      'http://127.0.0.1:8000',
      'http://localhost:8000',
      'http://127.0.0.1:5000',
      'http://localhost:5000'
    ]
  };

  // Log the backend URL for debugging
  useEffect(() => {
    console.log('🔧 API Configuration:', API_CONFIG.BASE_URL);
  }, []);

  // Test connection to backend
  const testConnection = async (url) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      let response;
      try {
        response = await fetch(`${url}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
      } catch {
        response = await fetch(`${url}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
      }

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log(`❌ Connection test failed for ${url}:`, error.message);
      return false;
    }
  };

  // Find working backend URL
  const findWorkingBackend = async () => {
    setConnectionStatus('testing');

    if (await testConnection(API_CONFIG.BASE_URL)) {
      setConnectionStatus('connected');
      return API_CONFIG.BASE_URL;
    }

    for (const url of API_CONFIG.FALLBACK_URLS) {
      if (await testConnection(url)) {
        setConnectionStatus('connected');
        return url;
      }
    }

    setConnectionStatus('disconnected');
    return null;
  };

  // Fetch available matches
  const fetchMatches = async () => {
    try {
      setError(null);

      const workingUrl = await findWorkingBackend();
      if (!workingUrl) {
        throw new Error('Cannot connect to backend server. Please ensure your FastAPI backend is running on port 8000.');
      }

      const response = await fetch(`${workingUrl}/api/matches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setMatches(Array.isArray(data) ? data : data.matches || []);
    } catch (error) {
      setError(`Failed to load matches: ${error.message}`);
      setMatches([]);
    }
  };

  // Generate predictions
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!matchId) {
      setError('⚠️ Please select a match first');
      return;
    }

    setLoading(true);
    setError(null);
    setPredictedTeams([]);

    try {
      const workingUrl = await findWorkingBackend();
      if (!workingUrl) {
        throw new Error('Backend server not available');
      }

      const predictionData = { match_id: matchId };
      const response = await fetch(`${workingUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(predictionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `Server error: ${response.status} ${response.statusText}`
        }));
        throw new Error(errorData.detail || `Prediction failed: ${response.status}`);
      }

      const result = await response.json();
      setPredictedTeams(result.teams && Array.isArray(result.teams) ? result.teams : []);
    } catch (error) {
      setError(`Prediction failed: ${error.message}`);
      setPredictedTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Connection status indicator
  const ConnectionStatus = () => {
    const statusConfig = {
      checking: { color: '#ffa500', text: '🔄 Initializing...', bg: '#fff3cd' },
      testing: { color: '#0066cc', text: '🔍 Finding FastAPI backend server...', bg: '#d1ecf1' },
      connected: { color: '#00aa00', text: '✅ FastAPI backend connected', bg: '#d4edda' },
      disconnected: { color: '#cc0000', text: '❌ FastAPI backend server not found (Expected: Port 8000)', bg: '#f8d7da' }
    };

    const status = statusConfig[connectionStatus] || statusConfig.disconnected;

    return (
      <div style={{
        padding: '0.75rem',
        backgroundColor: status.bg,
        borderRadius: '6px',
        marginBottom: '1.5rem',
        color: status.color,
        fontWeight: 'bold',
        border: `1px solid ${status.color}33`,
        textAlign: 'center'
      }}>
        {status.text}
        {connectionStatus === 'disconnected' && (
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 'normal' }}>
            Please ensure your FastAPI server is running: <code>uvicorn main:app --reload</code>
          </div>
        )}
      </div>
    );
  };

  // Load matches on component mount
  useEffect(() => {
    fetchMatches();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1000px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          color: '#333',
          marginBottom: '1rem',
          textAlign: 'center',
          fontSize: '2.5rem',
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🏏 GL Genie: Team Predictor
        </h1>

        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          AI-powered fantasy cricket team predictions
        </p>

        <ConnectionStatus />

        {error && (
          <div style={{
            color: '#721c24',
            backgroundColor: '#f8d7da',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            border: '1px solid #f5c6cb'
          }}>
            <strong>⚠️ Error:</strong> {error}
            <br />
            <button
              onClick={fetchMatches}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🔄 Retry Connection
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <label htmlFor="match-select" style={{
              fontWeight: 'bold',
              color: '#495057',
              fontSize: '1.1rem'
            }}>
              📅 Select Match:
            </label>

            <select
              id="match-select"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              style={{
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #ced4da',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Select a Match --</option>
              {matches.map((match) => (
                <option key={match.match_id || match.id} value={match.match_id || match.id}>
                  🏏 {match.team1} vs {match.team2} • 📅 {match.date}
                  {match.venue && ` • 🏟️ ${match.venue}`}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading || !matchId}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                backgroundColor: loading || !matchId ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || !matchId ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {loading ? (
                <>
                  <span style={{ marginRight: '0.5rem' }}>🤖</span>
                  Generating AI Prediction...
                </>
              ) : (
                '🎯 Generate Prediction'
              )}
            </button>
          </div>
        </form>

        {matches.length === 0 && !error && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ color: '#6c757d' }}>Loading Matches...</h3>
            <p style={{ color: '#6c757d' }}>Please wait while we fetch available matches</p>
          </div>
        )}

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            border: '1px solid #bbdefb',
            marginBottom: '2rem'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              animation: 'pulse 1.5s infinite'
            }}>
              🤖
            </div>
            <h3 style={{ color: '#1976d2', marginBottom: '0.5rem' }}>
              AI is Analyzing Match Data...
            </h3>
            <p style={{ color: '#1976d2', margin: 0 }}>
              Creating optimal fantasy team combination
            </p>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#bbdefb',
              borderRadius: '2px',
              marginTop: '1rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#2196f3',
                animation: 'loading 2s infinite'
              }}></div>
            </div>
          </div>
        )}

        {predictedTeams.length > 0 && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            border: '1px solid #c3e6c3'
          }}>
            <h2 style={{
              color: '#155724',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              🎯 AI-Generated Fantasy Team
            </h2>
            <PredictionDisplay teams={predictedTeams} />
          </div>
        )}

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }

          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Home;