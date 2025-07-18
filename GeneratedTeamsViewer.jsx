import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';

const GeneratedTeamsViewer = ({ teams }) => {
  const [filters, setFilters] = useState({
    team: '',
    captainVice: '',
    player: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredTeams = teams.filter(team => {
    const teamMatch = filters.team ? team.name === filters.team : true;
    const cvcMatch = filters.captainVice ? team.captain === filters.captainVice || team.viceCaptain === filters.captainVice : true;
    const playerMatch = filters.player ? team.players.some(p => p.name === filters.player) : true;
    return teamMatch && cvcMatch && playerMatch;
  });

  const exportJSON = () => {
    const dataStr = JSON.stringify(filteredTeams, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_teams.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Placeholder for Excel and Dream11 export functions
  const exportExcel = () => {
    alert('Excel export not implemented yet.');
  };

  const exportDream11 = () => {
    alert('Dream11 export not implemented yet.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold mb-4">Generated Teams Viewer</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-800 p-4 rounded-lg">
        <input
          type="text"
          name="team"
          placeholder="Filter by Team"
          value={filters.team}
          onChange={handleFilterChange}
          className="rounded px-3 py-1 bg-gray-700 text-white"
        />
        <input
          type="text"
          name="captainVice"
          placeholder="Filter by Captain/Vice"
          value={filters.captainVice}
          onChange={handleFilterChange}
          className="rounded px-3 py-1 bg-gray-700 text-white"
        />
        <input
          type="text"
          name="player"
          placeholder="Filter by Player"
          value={filters.player}
          onChange={handleFilterChange}
          className="rounded px-3 py-1 bg-gray-700 text-white"
        />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredTeams.length === 0 ? (
          <p className="text-gray-400">No teams to display.</p>
        ) : (
          filteredTeams.map((team, idx) => (
            <div key={idx} className="bg-gray-900 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-2">{team.name || `Team ${idx + 1}`}</h3>
              <ul className="text-sm space-y-1">
                {team.players.map((player, i) => (
                  <li key={i} className={`${player.role === 'C' ? 'font-bold text-yellow-400' : ''} ${player.role === 'VC' ? 'font-semibold text-yellow-300' : ''}`}>
                    {player.name} - {player.team} - Credits: {player.credits} {player.role ? `(${player.role})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Export Options */}
      <div className="flex space-x-4 mt-6">
        <button
          onClick={exportJSON}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          <Download className="inline-block mr-2 h-5 w-5" />
          Export JSON
        </button>
        <button
          onClick={exportExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Export Excel
        </button>
        <button
          onClick={exportDream11}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          Export Dream11
        </button>
      </div>
    </div>
  );
};

export default GeneratedTeamsViewer;
