'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';

const TeamDashboard = () => {
  const [team, setTeam] = useState(null);
  const [playerRole, setPlayerRole] = useState('player');
  const [loading, setLoading] = useState(true);
  const [captainName, setCaptainName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/team/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('user_jwt')}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
        //   console.error('Failed to fetch team data');
          return;
        }

        const data = await response.json();
        setTeam(data.team);
        setPlayerRole(data.role);
        setCaptainName(data.captainName);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const handleRemovePlayer = async (playerId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/team/remove/${playerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('user_jwt')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Error removing player:', response.statusText);
        return;
      }

      const data = await response.json();
      if (data && data.team) {
        setTeam((prevState) => ({
          ...prevState,
          players: prevState.players.filter((player) => player._id !== playerId),
        }));
      }
    } catch (error) {
      console.error('Error in fetch request:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const teamName = e.target.name.value;

    if (!teamName) {
      return setError("Team name is required");
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/team/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: teamName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        window.location.reload();
      } else {
        setError(data.error || 'Failed to create team');
      }
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/team/leave', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        window.location.reload();
      } else {
        setError(data.error || 'Failed to leave team');
      }
    } catch (err) {
      console.error('Error leaving team:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeamName = async (e) => {
    e.preventDefault();
    const newName = e.target.newName.value;

    if (!newName) {
      return setError("New team name is required");
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/team/updateTeamName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        window.location.reload();
      } else {
        setError(data.error || 'Failed to update team name');
      }
    } catch (err) {
      console.error('Error updating team name:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!team) {
    // If not part of a team, show the "Create Team" form
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="space-y-8 w-full max-w-5xl px-6">
          <Card className="p-8 bg-black shadow-xl rounded-lg">
            <h2 className="text-4xl font-bold text-white">Create Team</h2>
            <form onSubmit={handleCreateTeam} className="flex items-center space-x-4">
              <Input 
                type="text" 
                name="name" 
                placeholder="Team Name" 
                required 
                className="max-w-xs"
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Team'}
              </Button>
            </form>
            {error && <p className="text-red-500">{error}</p>}
            {message && <p className="text-green-500">{message}</p>}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="space-y-8 w-full max-w-5xl px-6">
        {/* Team Header */}
        <Card className="p-8 bg-black shadow-xl rounded-lg">
          <div className="flex items-center justify-between space-x-8">
            <div className="flex flex-col space-y-3">
              <h2 className="text-5xl font-bold text-white">{team?.name}</h2>
              <p className="text-xl text-gray-100">Captain: {captainName}</p>
            </div>
            {/* Leave Team Form */}
            <form onSubmit={handleLeaveTeam}>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading ? 'Leaving...' : 'Leave Team'}
              </Button>
            </form>
          </div>
        </Card>

        {/* Team Information */}
        <Card className="space-y-6 p-8">
          <h3 className="text-xl font-semibold">Team Info</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p><strong className="text-lg">Team Name:</strong> {team?.name}</p>
              <p><strong className="text-lg">Captain:</strong> {captainName}</p>
            </div>
            <div>
              <p><strong className="text-lg">Tournaments Participating:</strong> {team?.tournaments?.length || 0}</p>
              <p><strong className="text-lg">Tournaments Won:</strong> {team?.tournaments?.filter((t) => t.won).length || 0}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Members */}
          <Card className="space-y-6 p-8">
            <h3 className="text-xl font-semibold">Team Members</h3>
            <div className="space-y-4">
              {team?.players?.map((player) => (
                <div key={player._id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-200">
                  <p className="text-lg">{player.username}</p>
                  {playerRole === 'captain' && (
                    <Button
                      variant="destructive"
                      onClick={() => handleRemovePlayer(player._id)}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Participating Tournaments */}
          <Card className="space-y-6 p-8">
            <h3 className="text-xl font-semibold">Participating Tournaments</h3>
            {team?.tournaments?.length === 0 ? (
              <p className="text-lg">No tournaments participated yet.</p>
            ) : (
              <ul className="space-y-4">
                {team?.tournaments?.map((tournament) => (
                  <li key={tournament._id} className="p-4 border rounded-lg bg-gray-200">
                    <div className="flex justify-between items-center">
                      <p className="text-lg">{tournament.name}</p>
                      <Badge variant="outline">{tournament.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Update Team Name Form for Captain */}
        {playerRole === 'captain' && (
          <div className="space-y-6">
            <form onSubmit={handleUpdateTeamName} className="flex items-center space-x-4">
              <div className="flex-grow">
                <label htmlFor="newName" className="text-sm font-medium text-gray-700 block mb-1">New Team Name:</label>
                <Input 
                  type="text" 
                  id="newName" 
                  name="newName" 
                  required 
                  placeholder="Enter New Team Name" 
                  className="max-w-xs"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Team Name'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDashboard;
