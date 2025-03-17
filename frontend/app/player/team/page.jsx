'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

const TeamDashboard = () => {
  const [team, setTeam] = useState(null);
  const [playerRole, setPlayerRole] = useState('player');
  const [loading, setLoading] = useState(true);
  const [captainName, setCaptainName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [ongoingTournamentsCount, setOngoingTournamentsCount] = useState(0); // Add state for ongoing tournaments count
  const [tournamentsWonCount, setTournamentsWonCount] = useState(0); // Add state for tournaments won count
  const [userData, setUserData] = useState(null);
  const [hasTeamPayment, setHasTeamPayment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login...');
          router.push('/auth');
          return;
        }

        console.log('Fetching user profile...');
        const profileResponse = await fetch('http://localhost:5000/api/player/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const profileData = await profileResponse.json();
        console.log('User Profile Data:', profileData);
        
        setUserData(profileData.data);
        setHasTeamPayment(profileData.data?.teamPayment?.paid || false);
        
        // Now fetch team data if needed
        fetchTeamData(token);

      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const fetchTeamData = async (token) => {
    try {
      console.log('Fetching team data...');
      const response = await fetch('http://localhost:5000/api/team/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.log('No team data found or error');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Team Data:', data);
      
      setTeam(data.team);
      setPlayerRole(data.role);
      setCaptainName(data.captainName);
      setOngoingTournamentsCount(data.ongoingTournamentsCount); // Set ongoing tournaments count
      setTournamentsWonCount(data.tournamentsWonCount); // Set tournaments won count
    } catch (error) {
      console.error('Error fetching team data:', error);
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

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
      // Check payment status from state
      if (!hasTeamPayment) {
        console.log('No payment found, redirecting to payment page...');
        router.push('/payment');
        return;
      }

      console.log('Creating team with name:', teamName);
      const response = await fetch('http://localhost:5000/api/team/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('user_jwt')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ name: teamName }),
      });

      const data = await response.json();
      console.log('Team creation response:', data);

      if (response.ok) {
        setMessage(data.message);
        window.location.reload();
      } else {
        setError(data.error || 'Failed to create team');
      }
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden bg-white shadow-xl rounded-2xl">
            <div className="bg-gradient-to-r from-gray-900 to-black px-8 py-6">
              <h2 className="text-3xl font-bold text-white">Create Your Team</h2>
              <p className="text-gray-300 mt-2">Join the competition with your own team</p>
            </div>

            <div className="p-8 space-y-6">
              {/* Payment Status Card */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
                    <p className={`mt-1 ${hasTeamPayment ? "text-green-600" : "text-red-600"}`}>
                      {hasTeamPayment ? '✓ Payment Complete' : '○ Payment Required'}
                    </p>
                  </div>
                  {!hasTeamPayment && (
                    <Button 
                      onClick={() => router.push('/payment')}
                      className="bg-black hover:bg-gray-800 text-white transition-colors"
                    >
                      Make Payment
                    </Button>
                  )}
                </div>
              </div>

              {/* Team Creation Form */}
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name
                  </label>
                  <Input 
                    type="text" 
                    name="name" 
                    placeholder="Enter your team name" 
                    required 
                    className="w-full rounded-lg border-gray-300 focus:border-black focus:ring-black"
                    disabled={!hasTeamPayment}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !hasTeamPayment}
                  className={`w-full py-3 ${
                    hasTeamPayment 
                      ? 'bg-black hover:bg-gray-800' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } text-white font-medium rounded-lg transition-colors`}
                >
                  {loading ? 'Creating...' : 'Create Team'}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Team Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Team Header */}
        <Card className="overflow-hidden bg-gradient-to-r from-gray-900 to-black shadow-xl rounded-2xl">
          <div className="relative">
            {/* Default Cover Image */}
            <div className="w-full h-32 relative overflow-hidden">
              <Image
                src="/team-cover.webp" // Add this image to your public folder
                alt="Team Cover"
                fill
                className="object-cover opacity-40"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 w-full px-8 py-6 flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white">{team?.name}</h2>
                <p className="text-gray-300">Captain: {captainName}</p>
              </div>
              <Button 
                onClick={handleLeaveTeam}
                variant="outline"
                className="hover:bg-red-50 text-red-600 border-red-200 bg-white/90"
              >
                Leave Team
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Members', value: team?.players?.length || 0 },
            { label: 'Active Tournaments', value: ongoingTournamentsCount || 0 }, // Use ongoingTournamentsCount
            { label: 'Tournaments Won', value: tournamentsWonCount || 0 }, // Use tournamentsWonCount
            { label: 'Win Rate', value: `${Math.round((tournamentsWonCount || 0) / (team?.tournaments?.length || 1) * 100)}%` } // Use tournamentsWonCount
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
        

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Members */}
          <Card className="p-6 overflow-hidden">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h3>
            <div className="space-y-3">
              {team?.players?.map((player) => (
                <div 
                  key={player._id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {player.username[0].toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">{player.username}</p>
                  </div>
                  {playerRole === 'captain' && (
                    <Button
                      variant="ghost"
                      onClick={() => handleRemovePlayer(player._id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Tournaments */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tournaments</h3>
            {team?.tournaments?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tournaments yet
              </div>
            ) : (
              <div className="space-y-3">
                {team?.tournaments?.map((tournament) => (
                  <div 
                    key={tournament._id}
                    className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <p className="font-medium text-gray-900">{tournament.name}</p>
                    <Badge 
                      variant="outline"
                      className={`${
                        tournament.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tournament.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Captain Controls */}
        {playerRole === 'captain' && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Settings</h3>
            <form onSubmit={handleUpdateTeamName} className="flex gap-4">
              <Input 
                type="text" 
                name="newName" 
                placeholder="New team name" 
                className="max-w-xs"
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Name'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeamDashboard;