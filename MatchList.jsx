import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { matchApi } from '../../services/api';
import useStore from '../../store';
import { Button } from '../common/FormControls';

export default function MatchList() {
  const navigate = useNavigate();
  const { 
    filters,
    setFilters,
    matches,
    setMatches,
    isLoading,
    setLoading,
    setError,
    selectedMatch,
    setSelectedMatch
  } = useStore();

  // Fetch matches when filters change
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading('matches', true);
        const response = await matchApi.getUpcoming();
        setMatches(response.data);
      } catch (error) {
        setError('matches', error.message);
      } finally {
        setLoading('matches', false);
      }
    };

    fetchMatches();
  }, [filters]);

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    navigate(`/team-builder/${match.id}`);
  };

  if (isLoading.matches) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-4 gap-4">
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="rounded-md border-gray-300"
        />
        <select
          value={filters.format}
          onChange={(e) => setFilters({ ...filters, format: e.target.value })}
          className="rounded-md border-gray-300"
        >
          <option value="">All Formats</option>
          <option value="T20">T20</option>
          <option value="ODI">ODI</option>
          <option value="TEST">Test</option>
        </select>
        {/* Add more filters as needed */}
      </div>

      {/* Match List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {matches?.map((match) => (
            <div
              key={match.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                selectedMatch?.id === match.id ? 'bg-primary-50' : ''
              }`}
              onClick={() => handleMatchSelect(match)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {match.team1} vs {match.team2}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(match.date), 'PPP')}
                  </p>
                  <p className="text-sm text-gray-500">{match.format}</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMatchSelect(match);
                  }}
                >
                  Select Match
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
