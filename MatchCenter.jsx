import React, { useState, useEffect } from 'react';
import { CalendarDays, Filter, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MatchCenter = () => {
  const [matches, setMatches] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
    format: '',
    league: '',
    country: '',
  });
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/matches`);
        if (!res.ok) throw new Error('Failed to fetch matches');
        const data = await res.json();
        setMatches(data);
        setFilteredMatches(data);
      } catch (err) {
        console.error('Error fetching matches:', err);
      }
    };
    fetchMatches();
  }, [BACKEND_URL]);

  useEffect(() => {
    let filtered = matches;
    if (filters.date) {
      filtered = filtered.filter(m => m.date?.startsWith(filters.date));
    }
    if (filters.format) {
      filtered = filtered.filter(m => m.format?.toLowerCase() === filters.format.toLowerCase());
    }
    if (filters.league) {
      filtered = filtered.filter(m => m.league?.toLowerCase().includes(filters.league.toLowerCase()));
    }
    if (filters.country) {
      filtered = filtered.filter(m => m.country?.toLowerCase().includes(filters.country.toLowerCase()));
    }
    setFilteredMatches(filtered);
  }, [filters, matches]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold mb-4">Match Center</h1>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-col">
          <label htmlFor="date" className="text-sm mb-1">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="rounded px-3 py-1 bg-gray-700 text-white"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="format" className="text-sm mb-1">Format</label>
          <select
            id="format"
            name="format"
            value={filters.format}
            onChange={handleFilterChange}
            className="rounded px-3 py-1 bg-gray-700 text-white"
          >
            <option value="">All</option>
            <option value="T20">T20</option>
            <option value="ODI">ODI</option>
            <option value="Test">Test</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="league" className="text-sm mb-1">League</label>
          <input
            type="text"
            id="league"
            name="league"
            value={filters.league}
            onChange={handleFilterChange}
            placeholder="League"
            className="rounded px-3 py-1 bg-gray-700 text-white"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="country" className="text-sm mb-1">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value={filters.country}
            onChange={handleFilterChange}
            placeholder="Country"
            className="rounded px-3 py-1 bg-gray-700 text-white"
          />
        </div>
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredMatches.length === 0 ? (
          <p className="text-gray-400">No matches found.</p>
        ) : (
          filteredMatches.map((match) => (
            <motion.div
              key={match.id || `${match.team1}-${match.team2}-${match.date}`}
              className="bg-gray-900 rounded-lg p-4 shadow-md cursor-pointer hover:bg-gray-800"
              onClick={() => setSelectedMatch(match)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{match.team1} vs {match.team2}</h3>
                <span className="text-sm text-gray-400">{match.status || 'Scheduled'}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span><Clock className="inline mr-1" /> {match.start_time || 'N/A'}</span>
                <span><MapPin className="inline mr-1" /> {match.venue || 'N/A'}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Toss: {match.toss_result || 'N/A'}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Match Detail Popup */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-lg w-full relative">
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">
              {selectedMatch.team1} vs {selectedMatch.team2}
            </h2>
            <p><strong>Toss Result:</strong> {selectedMatch.toss_result || 'N/A'}</p>
            <p><strong>Pitch Info:</strong> {selectedMatch.pitch || 'N/A'}</p>
            <p><strong>Venue:</strong> {selectedMatch.venue || 'N/A'}</p>
            <p><strong>Weather:</strong> {selectedMatch.weather || 'N/A'}</p>
            <p><strong>GL Genie Confidence Score:</strong> {selectedMatch.confidence_score != null ? `${selectedMatch.confidence_score}%` : 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCenter;

