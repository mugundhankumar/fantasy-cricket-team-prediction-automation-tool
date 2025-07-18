import React, { useState } from 'react';

const SavedDataPanel = () => {
  const [savedMatches, setSavedMatches] = useState([
    { id: 1, name: 'Match 1', date: '2024-06-01' },
    { id: 2, name: 'Match 2', date: '2024-06-05' },
  ]);
  const [savedTeams, setSavedTeams] = useState([
    { id: 1, name: 'Team A', created: '2024-06-01' },
    { id: 2, name: 'Team B', created: '2024-06-05' },
  ]);

  const handleView = (item) => {
    alert("Viewing: " + item.name);
  };

  const handleEdit = (item) => {
    alert("Editing: " + item.name);
  };

  const handleDownload = (item) => {
    alert("Downloading: " + item.name);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-semibold mb-6">Saved Data Panel</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">My Saved Matches</h2>
        <ul className="space-y-2">
          {savedMatches.map(match => (
            <li key={match.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
              <span>{match.name} - {match.date}</span>
              <div className="space-x-2">
                <button onClick={() => handleView(match)} className="text-indigo-400 hover:underline">View</button>
                <button onClick={() => handleEdit(match)} className="text-yellow-400 hover:underline">Edit</button>
                <button onClick={() => handleDownload(match)} className="text-green-400 hover:underline">Download</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">My Generated Teams</h2>
        <ul className="space-y-2">
          {savedTeams.map(team => (
            <li key={team.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
              <span>{team.name} - Created on {team.created}</span>
              <div className="space-x-2">
                <button onClick={() => handleView(team)} className="text-indigo-400 hover:underline">View</button>
                <button onClick={() => handleEdit(team)} className="text-yellow-400 hover:underline">Edit</button>
                <button onClick={() => handleDownload(team)} className="text-green-400 hover:underline">Download</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default SavedDataPanel;
