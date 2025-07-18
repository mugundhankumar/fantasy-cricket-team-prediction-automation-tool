import React, { useState } from 'react';
import { Upload, Settings, Users, Sliders, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const TeamGenerationPanel = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [fixedPlayers, setFixedPlayers] = useState([]);
  const [teamSplit, setTeamSplit] = useState('7-4');
  const [captainLogic, setCaptainLogic] = useState('Auto');
  const [teamCount, setTeamCount] = useState(1);
  const [avoidDuplicate, setAvoidDuplicate] = useState(false);
  const [budgetRange, setBudgetRange] = useState([80, 100]);
  const [loading, setLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState({
    keyPlayers: [],
    weakSpots: [],
    predictedWinner: '',
  });

  const handleCsvUpload = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleGenerateTeams = () => {
    setLoading(true);
    // Placeholder for API call to generate teams
    setTimeout(() => {
      setLoading(false);
      setAiPreview({
        keyPlayers: ['Player A', 'Player B'],
        weakSpots: ['Bowling', 'Fielding'],
        predictedWinner: 'Team A',
      });
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6">Team Generation Panel</h1>

      {/* CSV Upload */}
      <div>
        <label className="flex items-center space-x-2 cursor-pointer text-indigo-400 hover:text-indigo-600">
          <Upload className="w-6 h-6" />
          <span>Upload CSV</span>
          <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
        </label>
        {csvFile && <p className="mt-2 text-green-400">Uploaded: {csvFile.name}</p>}
      </div>

      {/* Manual Player Stats Entry (Optional) */}
      <div>
        <label className="block mb-2 font-semibold">Manual Player Stats Entry (Optional)</label>
        <textarea
          rows={4}
          placeholder="Enter player stats manually..."
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
      </div>

      {/* Configuration Panel */}
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Fixed Players (multi-select)</label>
          <select multiple className="w-full p-2 rounded bg-gray-800 text-white" value={fixedPlayers} onChange={e => {
            const options = e.target.options;
            const selected = [];
            for (let i = 0; i < options.length; i++) {
              if (options[i].selected) selected.push(options[i].value);
            }
            setFixedPlayers(selected);
          }}>
            <option value="Player 1">Player 1</option>
            <option value="Player 2">Player 2</option>
            <option value="Player 3">Player 3</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="font-semibold">7-4 Team Split</label>
          <input
            type="checkbox"
            checked={teamSplit === '7-4'}
            onChange={() => setTeamSplit(teamSplit === '7-4' ? 'default' : '7-4')}
            className="w-5 h-5"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Captain/Vice Logic</label>
          <select
            className="w-full p-2 rounded bg-gray-800 text-white"
            value={captainLogic}
            onChange={e => setCaptainLogic(e.target.value)}
          >
            <option value="Auto">Auto</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Team Count (1–40)</label>
          <input
            type="number"
            min={1}
            max={40}
            value={teamCount}
            onChange={e => setTeamCount(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="font-semibold">Avoid Duplicate</label>
          <input
            type="checkbox"
            checked={avoidDuplicate}
            onChange={() => setAvoidDuplicate(!avoidDuplicate)}
            className="w-5 h-5"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Budget Range</label>
          <input
            type="range"
            min={50}
            max={150}
            value={budgetRange[1]}
            onChange={e => setBudgetRange([budgetRange[0], Number(e.target.value)])}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{budgetRange[0]}</span>
            <span>{budgetRange[1]}</span>
          </div>
        </div>
      </div>

      {/* AI Preview Box */}
      <div className="p-4 bg-gray-800 rounded-lg shadow-inner">
        <h2 className="text-xl font-semibold mb-2">AI Preview</h2>
        <p><strong>Key Players:</strong> {aiPreview.keyPlayers.join(', ') || 'N/A'}</p>
        <p><strong>Weak Spots:</strong> {aiPreview.weakSpots.join(', ') || 'N/A'}</p>
        <p><strong>Predicted Winner:</strong> {aiPreview.predictedWinner || 'N/A'}</p>
      </div>

      {/* Generate Teams Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={handleGenerateTeams}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-5 h-5" />
          <span>{loading ? 'Generating...' : 'Generate Teams'}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default TeamGenerationPanel;
