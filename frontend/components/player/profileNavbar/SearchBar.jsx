'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button'; // ShadCN Button component
import PlayerResult from './PlayerResult'; // Component to render player results
import TeamResult from './TeamResult'; // Component to render team results
import { Input } from "@/components/ui/input";
import { ChevronLeft } from 'lucide-react'; // For back button icon
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]); // Unified results array
  const [searchType, setSearchType] = useState(''); // 'player' or 'team'
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Control dialog open state
  const [message, setMessage] = useState(''); // State for error/success messages
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!searchTerm.trim()) {
      setMessage("Please enter a search term.");
      return;
    }
  
    const initialChar = searchTerm.trim().charAt(0);
    let actionUrl = '';
    let updatedSearchTerm = searchTerm.trim();
    let newSearchType = '';
  
    if (initialChar === '&') {
      actionUrl = '/api/player/searchPlayer';
      updatedSearchTerm = updatedSearchTerm.slice(1).trim();
      newSearchType = 'player';
    } else if (initialChar === '>') {
      actionUrl = '/api/team/search';
      updatedSearchTerm = updatedSearchTerm.slice(1).trim();
      newSearchType = 'team';
    } else {
      setMessage('Invalid search format. Use "&" for player and ">" for team.');
      return;
    }
  
    if (!updatedSearchTerm) {
      setMessage('Please provide a term to search after the symbol.');
      return;
    }
  
    setLoading(true);
    setResults([]);
    setIsOpen(false);
    setMessage('');
    setSearchType(newSearchType);
  
    try {
      const token = localStorage.getItem('token');
  
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
  
      const url = `${baseUrl}${actionUrl}?searchTerm=${encodeURIComponent(updatedSearchTerm)}`;
      console.log("🔍 Fetching search results from:", url);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
  
      if (!response) {
        throw new Error("No response received from the server.");
      }
  
      console.log("📡 API Response Status:", response.status);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch. Status: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("✅ Search Results:", data);
  
      if (newSearchType === 'player') {
        setResults(data.results || []);
      } else if (newSearchType === 'team') {
        setResults(data.teams || []);
      }
  
      if ((newSearchType === 'player' && (data.results || []).length > 0) ||
          (newSearchType === 'team' && (data.teams || []).length > 0)) {
        setIsOpen(true);
      } else {
        setMessage(`No ${newSearchType} found for "${updatedSearchTerm}".`);
      }
  
    } catch (error) {
      console.error("🚨 Error fetching search results:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlayerDetails = async (player) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${baseUrl}/api/player/details/${player._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch player details');
      }

      const detailedPlayer = await response.json();
      
      setSelectedPlayer({
        ...player,
        ...detailedPlayer,
        globalRank: detailedPlayer.globalRank,
        tournamentsPlayed: detailedPlayer.tournamentsPlayed,
        tournamentsWon: detailedPlayer.tournamentsWon,
        winPercentage: detailedPlayer.winPercentage,
        ongoingTournaments: detailedPlayer.ongoingTournaments,
        noOfOrgsFollowing: detailedPlayer.noOfOrgsFollowing
      });
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching player details:', error);
      // Show error message to user
      setMessage('Failed to load player details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewTeamDetails = (team) => {
    setSelectedTeam(team);
    setShowDetailsDialog(true);
  };

  const handleBackToResults = () => {
    setShowDetailsDialog(false);
    setSelectedPlayer(null);
    setSelectedTeam(null);
  };

  return (
    <div className="relative">
      {/* Display Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.startsWith('No') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <Input
          type="text"
          id="search-input"
          name="searchTerm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Use '&' for player or '>' for team"
          required
          aria-label="Search players and teams"
          className="p-3 w-80 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {/* Main Search Results Dialog */}
      <Dialog open={isOpen && !showDetailsDialog} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[50vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
            <DialogDescription>
              Results for "{searchTerm.trim()}"
            </DialogDescription>
          </DialogHeader>

          {/* Player Results */}
          {searchType === 'player' && results.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Players Found</h2>
              {results.map((player) => (
                <div key={player._id} className="relative mb-4">
                  <PlayerResult player={player} />
                  <Button
                    onClick={() => handleViewPlayerDetails(player)}
                    className="absolute bottom-4 right-4"
                    variant="secondary"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Team Results */}
          {searchType === 'team' && results.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Teams Found</h2>
              {results.map((team) => (
                <div key={team._id} className="relative mb-4">
                  <TeamResult team={team} />
                  <Button
                    onClick={() => handleViewTeamDetails(team)}
                    className="absolute bottom-4 right-4"
                    variant="secondary"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!results.length && (
            <p className="text-gray-500">No results found for "{searchTerm.trim()}".</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-[45vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <Button
              variant="ghost"
              className="absolute left-4 top-4"
              onClick={handleBackToResults}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Results
            </Button>
            <DialogTitle>
              {selectedPlayer ? ' ' : ' '}
            </DialogTitle>
          </DialogHeader>

          {selectedPlayer && (
            <section className="bg-white p-10 rounded-3xl shadow-lg">
              {loadingDetails ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <>
                  {console.log('Selected Player Data:', selectedPlayer)}
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">
                    Statistics
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left column - Stats Grid */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Global Rank', value: selectedPlayer.globalRank ? selectedPlayer.globalRank : 'N/A' },
                          { label: 'Tournaments Played', value: selectedPlayer.tournamentsPlayed || 0 },
                          { label: 'Tournaments Won', value: selectedPlayer.tournamentsWon || 0 },
                          { label: 'Win Rate', value: `${selectedPlayer.winPercentage || 0}%` },
                          { label: 'Active Tournaments', value: selectedPlayer.ongoingTournaments || 0 },
                          { label: 'Organisers Following', value: selectedPlayer.noOfOrgsFollowing || 0 }
                        ].map((stat, idx) => (
                          <div 
                            key={idx} 
                            className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col items-center justify-center min-h-[140px] hover:border-gray-200 transition-colors"
                          >
                            <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                            <p className="text-sm font-medium text-gray-500 text-center">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column - Performance Overview */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h3>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart outerRadius={130} data={[
                            {
                              subject: 'Win Rate',
                              value: selectedPlayer.winPercentage || 0,
                              fullMark: 100,
                            },
                            {
                              subject: 'Tournaments',
                              value: Math.min((selectedPlayer.tournamentsPlayed || 0) * 10, 100),
                              fullMark: 100,
                            },
                            {
                              subject: 'Global Rank',
                              value: selectedPlayer.globalRank > 0 ? Math.max(100 - selectedPlayer.globalRank, 0) : 0,
                              fullMark: 100,
                            },
                            {
                              subject: 'Active Tournaments',
                              value: (selectedPlayer.ongoingTournaments || 0) * 20,
                              fullMark: 100,
                            },
                            {
                              subject: 'Organisers Following',
                              value: (selectedPlayer.noOfOrgsFollowing || 0) * 10,
                              fullMark: 100,
                            },
                          ]}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis 
                              dataKey="subject" 
                              tick={{ fill: '#4b5563', fontSize: 12 }} 
                            />
                            <Radar
                              name="Player Stats"
                              dataKey="value"
                              stroke="#000000"
                              fill="#000000"
                              fillOpacity={0.2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {selectedTeam && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedTeam.name}</h3>
                <p><strong>Captain:</strong> {selectedTeam.captain?.username || 'N/A'}</p>
                <p><strong>Members:</strong> {selectedTeam.players?.length || 0}</p>
                <p><strong>Tournaments:</strong> {selectedTeam.tournaments?.length || 0}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleBackToResults}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchBar;
