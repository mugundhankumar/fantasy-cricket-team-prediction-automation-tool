import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { matchApi, teamApi } from '../../services/api';
import useStore from '../../store';
import { Button, Select } from '../common/FormControls';

export default function TeamBuilder() {
  const { matchId } = useParams();
  const {
    selectedMatch,
    setSelectedMatch,
    team1Players,
    team2Players,
    setTeam1Players,
    setTeam2Players,
    generatedTeams,
    setGeneratedTeams,
    isLoading,
    setLoading,
    setError,
  } = useStore();

  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teamPreferences, setTeamPreferences] = useState({
    captainStrategy: 'balanced',
    teamComposition: '6-5',
    maxBudget: 100,
  });

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setLoading('matchDetails', true);
        const [matchResponse, squadsResponse] = await Promise.all([
          matchApi.getDetails(matchId),
          matchApi.getSquads(matchId),
        ]);
        
        setSelectedMatch(matchResponse.data);
        setTeam1Players(squadsResponse.data.team1Players);
        setTeam2Players(squadsResponse.data.team2Players);
      } catch (error) {
        setError('matchDetails', error.message);
      } finally {
        setLoading('matchDetails', false);
      }
    };

    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId, setError, setLoading, setSelectedMatch, setTeam1Players, setTeam2Players]);

  const handlePlayerSelect = (playerId) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length >= 11) {
        alert('You can only select 11 players');
        return prev;
      }
      return [...prev, playerId];
    });
  };

  const handleGenerateTeams = async () => {
    try {
      setLoading('teamGeneration', true);
      const response = await teamApi.generate(matchId, {
        selectedPlayers,
        ...teamPreferences,
      });
      setGeneratedTeams(response.data);
    } catch (error) {
      setError('teamGeneration', error.message);
    } finally {
      setLoading('teamGeneration', false);
    }
  };

  if (isLoading.matchDetails) {
    return <div>Loading match details...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Match Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {selectedMatch?.team1} vs {selectedMatch?.team2}
        </h2>
        <div className="grid grid-cols-2 gap-8">
          {/* Team 1 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedMatch?.team1} Players
            </h3>
            <div className="space-y-2">
              {team1Players.map((player) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-md cursor-pointer ${
                    selectedPlayers.includes(player.id)
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handlePlayerSelect(player.id)}
                >
                  <div className="flex justify-between items-center">
                    <span>{player.name}</span>
                    <span className="text-sm text-gray-500">
                      Credits: {player.credits}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team 2 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedMatch?.team2} Players
            </h3>
            <div className="space-y-2">
              {team2Players.map((player) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-md cursor-pointer ${
                    selectedPlayers.includes(player.id)
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handlePlayerSelect(player.id)}
                >
                  <div className="flex justify-between items-center">
                    <span>{player.name}</span>
                    <span className="text-sm text-gray-500">
                      Credits: {player.credits}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Team Preferences
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Captain Strategy"
            value={teamPreferences.captainStrategy}
            onChange={(e) =>
              setTeamPreferences({
                ...teamPreferences,
                captainStrategy: e.target.value,
              })
            }
            options={[
              { value: 'balanced', label: 'Balanced' },
              { value: 'aggressive', label: 'Aggressive' },
              { value: 'defensive', label: 'Defensive' },
            ]}
          />
          <Select
            label="Team Composition"
            value={teamPreferences.teamComposition}
            onChange={(e) =>
              setTeamPreferences({
                ...teamPreferences,
                teamComposition: e.target.value,
              })
            }
            options={[
              { value: '6-5', label: '6-5 Split' },
              { value: '5-6', label: '5-6 Split' },
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Budget
            </label>
            <input
              type="number"
              value={teamPreferences.maxBudget}
              onChange={(e) =>
                setTeamPreferences({
                  ...teamPreferences,
                  maxBudget: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          isLoading={isLoading.teamGeneration}
          onClick={handleGenerateTeams}
          disabled={selectedPlayers.length < 11}
        >
          Generate Teams
        </Button>
      </div>

      {/* Generated Teams */}
      {generatedTeams.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Generated Teams
          </h3>
          <div className="space-y-4">
            {generatedTeams.map((team, index) => (
              <div
                key={index}
                className="border rounded-md p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Team {index + 1}</h4>
                  <span className="text-sm text-gray-500">
                    Total Credits: {team.totalCredits}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Captain: {team.captain}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Vice Captain: {team.viceCaptain}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Players: {team.players.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
