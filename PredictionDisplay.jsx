import React from 'react';

const PredictionDisplay = ({ teams }) => {
  if (!teams || teams.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '2px dashed #dee2e6'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤔</div>
        <p style={{ color: '#6c757d' }}>No predictions available</p>
      </div>
    );
  }

  const getPositionEmoji = (position) => {
    const emojiMap = {
      'WK': '🧤',
      'BAT': '🏏',
      'ALL': '⚡',
      'BOWL': '🎯'
    };
    return emojiMap[position] || '👤';
  };

  const getPositionColor = (position) => {
    const colorMap = {
      'WK': '#e74c3c',
      'BAT': '#3498db', 
      'ALL': '#f39c12',
      'BOWL': '#27ae60'
    };
    return colorMap[position] || '#95a5a6';
  };

  const getPositionName = (position) => {
    const nameMap = {
      'WK': 'Wicket Keeper',
      'BAT': 'Batsman',
      'ALL': 'All Rounder',
      'BOWL': 'Bowler'
    };
    return nameMap[position] || position;
  };

  // Function to parse player data - handles both string and object formats
  const parsePlayerData = (player) => {
    if (typeof player === 'string') {
      // If it's just a string, create a player object
      return {
        name: player,
        position: 'BAT', // Default position
        points: Math.floor(Math.random() * 100) + 50, // Random points for demo
        price: Math.floor(Math.random() * 50) + 80, // Random price for demo
        team: 'TBD'
      };
    } else if (typeof player === 'object' && player !== null) {
      // If it's already an object, use it as is
      return {
        name: player.name || player.player_name || 'Unknown Player',
        position: player.position || 'BAT',
        points: player.points || player.predicted_points || 'N/A',
        price: player.price || 'N/A',
        team: player.team || 'TBD'
      };
    }
    return {
      name: 'Unknown Player',
      position: 'BAT',
      points: 'N/A',
      price: 'N/A',
      team: 'TBD'
    };
  };

  // Function to randomly assign positions for better display
  const assignRandomPositions = (players) => {
    const positions = ['WK', 'BAT', 'BAT', 'BAT', 'ALL', 'ALL', 'ALL', 'BOWL', 'BOWL', 'BOWL', 'BOWL'];
    return players.map((player, index) => ({
      ...parsePlayerData(player),
      position: positions[index] || 'BAT'
    }));
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {teams.map((team, teamIndex) => {
        // Parse and process players
        const processedPlayers = team.players ? assignRandomPositions(team.players) : [];
        
        return (
          <div key={teamIndex} style={{ marginBottom: '2rem' }}>
            {/* Team Header */}
            <div style={{
              backgroundColor: '#2c3e50',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '8px 8px 0 0',
              textAlign: 'center'
            }}>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>
                🏆 Predicted Fantasy Team {teams.length > 1 ? `#${teamIndex + 1}` : ''}
              </h2>
              {team.team1 && team.team2 && (
                <p style={{ margin: '0', fontSize: '1.1rem', opacity: 0.9 }}>
                  {team.team1} vs {team.team2}
                </p>
              )}
            </div>

            {/* Team Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              padding: '1.5rem',
              backgroundColor: '#34495e',
              color: 'white'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {team.total_points || processedPlayers.reduce((sum, p) => sum + (typeof p.points === 'number' ? p.points : 0), 0) || 'N/A'}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Points</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👑</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {team.captain || 'TBD'}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Captain (2x)</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥈</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {team.vice_captain || 'TBD'}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Vice Captain (1.5x)</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {processedPlayers.length}/11
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Players</div>
              </div>
            </div>

            {/* Players List */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {processedPlayers && processedPlayers.length > 0 ? (
                <>
                  {/* Table Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 80px 80px 100px',
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: '#ecf0f1',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #bdc3c7'
                  }}>
                    <div>👤 Player Name</div>
                    <div style={{ textAlign: 'center' }}>🏏 Position</div>
                    <div style={{ textAlign: 'center' }}>📊 Points</div>
                    <div style={{ textAlign: 'center' }}>💰 Price</div>
                    <div style={{ textAlign: 'center' }}>🏟️ Team</div>
                  </div>

                  {/* Player Rows */}
                  {processedPlayers.map((player, playerIndex) => {
                    const isCaptain = player.name === team.captain;
                    const isViceCaptain = player.name === team.vice_captain;
                    
                    return (
                      <div
                        key={playerIndex}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 100px 80px 80px 100px',
                          gap: '1rem',
                          padding: '1rem',
                          borderBottom: '1px solid #ecf0f1',
                          backgroundColor: isCaptain ? '#fff3cd' : isViceCaptain ? '#d1ecf1' : 'white',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isCaptain && !isViceCaptain) {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCaptain && !isViceCaptain) {
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontWeight: isCaptain || isViceCaptain ? 'bold' : 'normal'
                        }}>
                          {isCaptain && <span style={{ marginRight: '0.5rem' }}>👑</span>}
                          {isViceCaptain && <span style={{ marginRight: '0.5rem' }}>🥈</span>}
                          {player.name}
                        </div>
                        
                        <div style={{ 
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem'
                        }}>
                          <span style={{ 
                            backgroundColor: getPositionColor(player.position),
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {getPositionEmoji(player.position)} {player.position}
                          </span>
                        </div>
                        
                        <div style={{ 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: '#27ae60'
                        }}>
                          {player.points || 'N/A'}
                        </div>
                        
                        <div style={{ 
                          textAlign: 'center',
                          color: '#e67e22'
                        }}>
                          {player.price !== 'N/A' ? `₹${player.price}` : 'N/A'}
                        </div>
                        
                        <div style={{ 
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          color: '#7f8c8d'
                        }}>
                          {player.team || 'TBD'}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  color: '#7f8c8d'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                  <p>No player data available</p>
                </div>
              )}
            </div>

            {/* Team Strategy */}
            {team.strategy && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#e8f6f3',
                borderRadius: '6px',
                border: '1px solid #a3e4d7'
              }}>
                <h4 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: '#138d75',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🧠 AI Strategy
                </h4>
                <p style={{ margin: 0, color: '#0e6b5c' }}>
                  {team.strategy}
                </p>
              </div>
            )}

            {/* Position Summary */}
            {processedPlayers.length > 0 && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #dee2e6'
              }}>
                <h4 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#495057',
                  textAlign: 'center'
                }}>
                  📋 Team Composition
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.5rem'
                }}>
                  {['WK', 'BAT', 'ALL', 'BOWL'].map(position => {
                    const count = processedPlayers.filter(p => p.position === position).length;
                    return (
                      <div key={position} style={{
                        textAlign: 'center',
                        padding: '0.75rem',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                      }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                          {getPositionEmoji(position)}
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                          {count}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                          {getPositionName(position)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
              onClick={() => {
                const teamData = JSON.stringify(team, null, 2);
                navigator.clipboard.writeText(teamData);
                alert('Team data copied to clipboard!');
              }}>
                📋 Copy Team Data
              </button>
              
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#229954'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#27ae60'}
              onClick={() => {
                const playerNames = processedPlayers.map(p => p.name).join('\n');
                navigator.clipboard.writeText(playerNames);
                alert('Player names copied to clipboard!');
              }}>
                📝 Copy Player Names
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PredictionDisplay;