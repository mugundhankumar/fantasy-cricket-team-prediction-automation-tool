import React, { useState, useEffect } from 'react';

// Main Dashboard component for Fantasy Team Predictor (advanced UI with live API calls)
function Dashboard() {
    /* -------------------------------------------------------------------------
       State Management
    -------------------------------------------------------------------------*/
    const [matches, setMatches] = useState([]);            // Upcoming matches
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [team1Players, setTeam1Players] = useState('');  // Squad text areas
    const [team2Players, setTeam2Players] = useState('');
    const [winnerTeam, setWinnerTeam] = useState('');      // Predicted winner
    const [maxCombinations, setMaxCombinations] = useState(5);
    const [generatedTeams, setGeneratedTeams] = useState([]);

    // Loading / feedback states
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [loadingSquads, setLoadingSquads] = useState(false);
    const [loadingPrediction, setLoadingPrediction] = useState(false);
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // File upload
    const [selectedFile, setSelectedFile] = useState(null);

    /* -------------------------------------------------------------------------
       Backend base URL – fallback to localhost if .env missing
    -------------------------------------------------------------------------*/
    const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

    /* -------------------------------------------------------------------------
       Fetch upcoming matches on mount
    -------------------------------------------------------------------------*/
    useEffect(() => {
        const fetchMatches = async () => {
            setLoadingMatches(true);
            setError(null);
            setSuccessMessage(null);
            try {
                const response = await fetch(`${BACKEND_URL}/api/matches`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP ${response.status} – ${errorData.detail || response.statusText}`);
                }
                const data = await response.json();
                setMatches(data);
                if (data.length > 0) {
                    setSelectedMatch(data[0]);
                    setWinnerTeam(data[0].team1); // default winner
                }
            } catch (err) {
                console.error('Error fetching matches:', err);
                setError(`Failed to fetch matches: ${err.message}. Ensure backend is running.`);
            } finally {
                setLoadingMatches(false);
            }
        };
        fetchMatches();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* -------------------------------------------------------------------------
       Fetch squads whenever selectedMatch changes
    -------------------------------------------------------------------------*/
    useEffect(() => {
        const fetchSquads = async () => {
            if (!selectedMatch?.match_id) return;

            setLoadingSquads(true);
            setError(null);
            setTeam1Players('');
            setTeam2Players('');
            try {
                const response = await fetch(`${BACKEND_URL}/api/match_squads/${selectedMatch.match_id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP ${response.status} – ${errorData.detail || response.statusText}`);
                }
                const data = await response.json();
                setTeam1Players(data.team1_players.join('\n'));
                setTeam2Players(data.team2_players.join('\n'));
            } catch (err) {
                console.error('Error fetching squads:', err);
                setError(`Failed to fetch squads: ${err.message}.`);
                setTeam1Players('Error loading players – please enter manually.');
                setTeam2Players('Error loading players – please enter manually.');
            } finally {
                setLoadingSquads(false);
            }
        };
        fetchSquads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMatch]);

    /* -------------------------------------------------------------------------
       Handlers
    -------------------------------------------------------------------------*/
    const handleMatchChange = (e) => {
        const match = matches.find(m => m.match_id === e.target.value);
        setSelectedMatch(match);
        if (match) {
            setWinnerTeam(match.team1);
            setGeneratedTeams([]);
            setError(null);
            setSuccessMessage(null);
        }
    };

    const handleGetPrediction = async () => {
        if (!selectedMatch) return setError('Please select a match first.');
        if (!team1Players.trim() || !team2Players.trim()) return setError('Player lists cannot be empty.');
        if (!winnerTeam) return setError('Please select a predicted winner.');

        setLoadingPrediction(true);
        setError(null);
        setSuccessMessage(null);
        setGeneratedTeams([]);

        const parsedTeam1 = team1Players.split('\n').map(p => p.trim()).filter(Boolean);
        const parsedTeam2 = team2Players.split('\n').map(p => p.trim()).filter(Boolean);

        try {
            const response = await fetch(`${BACKEND_URL}/api/predict_team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    match_id: selectedMatch.match_id,
                    team1: selectedMatch.team1,
                    team2: selectedMatch.team2,
                    team1_players: parsedTeam1,
                    team2_players: parsedTeam2,
                    winner_team: winnerTeam,
                    max_combinations: maxCombinations
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status} – ${errorData.detail || response.statusText}`);
            }
            const data = await response.json();
            setGeneratedTeams(data.teams || []);
            setSuccessMessage(data.message || 'Predictions generated successfully!');
        } catch (err) {
            console.error('Prediction error:', err);
            setError(`Prediction failed: ${err.message}`);
        } finally {
            setLoadingPrediction(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setSuccessMessage(null);
        setError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) return setError('Please select a CSV file to upload.');
        setLoadingUpload(true);
        setError(null);
        setSuccessMessage(null);
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const response = await fetch(`${BACKEND_URL}/api/upload-teams`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status} – ${errorData.detail || response.statusText}`);
            }
            const result = await response.json();
            setSuccessMessage(result.message || 'File uploaded successfully!');
            setSelectedFile(null);
            document.getElementById('csv-file-input').value = '';
        } catch (err) {
            console.error('Upload error:', err);
            setError(`Upload failed: ${err.message}`);
        } finally {
            setLoadingUpload(false);
        }
    };

    const handleDownload = () => {
        if (generatedTeams.length === 0) return setError('Generate predictions first.');
        setSuccessMessage(null);
        const headers = ['Team Number', 'Captain', 'Vice-Captain', 'Players'];
        const rows = generatedTeams.map((t, i) => [
            `Team ${i + 1}`,
            `"${t.captain}"`,
            `"${t.vice_captain}"`,
            `"${t.players.join(', ')}"`
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `predicted_teams_${selectedMatch?.match_id || 'unknown'}.csv`;
        link.click();
    };

    /* -------------------------------------------------------------------------
       JSX UI
    -------------------------------------------------------------------------*/
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 font-inter">
            {/* Tailwind CDN (for quick demo) */}
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Inline styles omitted for brevity – keep your existing <style> block */}

            {/* ---- main card ---- */}
            {/* ... Keep existing JSX exactly as before ... */}
        </div>
    );
}

export default Dashboard;
