'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/player/profileNavbar/Navbar';
import ProfilePicture from '@/components/player/profileNavbar/ProfilePicture';
import { UserProvider } from '@/context/UserContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const WinRateCircle = ({ percentage }) => (
  <div className="w-32 h-32 mx-auto">
    <CircularProgressbar
      value={percentage || 0}
      text={`${percentage || 0}%`}
      styles={buildStyles({
        textSize: '16px',
        pathColor: '#000000',
        textColor: '#000000',
        trailColor: '#e5e7eb',
      })}
    />
  </div>
);

const PlayerProfile = () => {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlayerData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        // Optionally, redirect to login or show a message
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/player/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch player data');
        }

        const data = await response.json();
        // Expecting the dashboard data to be in the "player" field
        setPlayerData(data.player);
      } catch (error) {
        console.error('Error fetching player data:', error);
        // Optionally, set an error state to display a message
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  const handleTeamRedirect = () => {
    router.push('/player/team');
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar /> {/* Navbar remains visible during loading */}
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar /> {/* Navbar remains visible on error */}
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl font-semibold text-red-500">
            Unable to load profile data.
          </div>
        </div>
      </div>
    );
  }

  // Ensure globalRank is a valid number before using it in calculations
  const globalRankValue = typeof playerData.globalRank === 'number' ? playerData.globalRank : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-[91%] mt-[20px] mx-auto">
        <Navbar /> {/* Navbar at the top */}
      </div>
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Player Profile Section */}
          <section className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-lg">
            <UserProvider>
              <div className="ml-[40px] flex items-center space-x-16">
                <div className="w-48 h-48 rounded-full overflow-hidden">
                  <ProfilePicture />
                </div>
                <div className="flex-grow">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                    Profile
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="w-40 font-medium text-gray-700 dark:text-gray-300">Username:</span>
                      <span className="text-gray-900 dark:text-gray-100">{playerData.username}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-40 font-medium text-gray-700 dark:text-gray-300">Email:</span>
                      <span className="text-gray-900 dark:text-gray-100">{playerData.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-40 font-medium text-gray-700 dark:text-gray-300">Team:</span>
                      <Button
                        onClick={handleTeamRedirect}
                        className={`mt-0 ${
                          playerData.team
                            ? 'bg-black hover:bg-gray-800 text-white shadow-md transform transition-all duration-200 ease-in-out hover:scale-105'
                            : 'border border-black text-white hover:bg-black-100 shadow-sm transform transition-all duration-200 ease-in-out hover:scale-105'
                        } rounded-lg px-6 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`}
                      >
                        {playerData.team ? `${playerData.team.name}` : 'No Team'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </UserProvider>
          </section>

          {/* Player Stats Section */}
          <section className="bg-white p-10 rounded-3xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              Statistics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column - Stats Grid */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Global Rank', value: playerData.globalRank ? playerData.globalRank : 'N/A' },
                    { label: 'Tournaments Played', value: playerData.tournamentsPlayed || 0 },
                    { label: 'Tournaments Won', value: playerData.tournamentsWon || 0 },
                    { label: 'Win Rate', value: `${playerData.winPercentage || 0}%` },
                    { label: 'Active Tournaments', value: playerData.ongoingTournaments || 0 },
                    { label: 'Organisers Following', value: playerData.noOfOrgsFollowing || 0 }
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
                        value: playerData.winPercentage || 0,
                        fullMark: 100,
                      },
                      {
                        subject: 'Tournaments',
                        value: Math.min((playerData.tournamentsPlayed || 0) * 10, 100),
                        fullMark: 100,
                      },
                      {
                        subject: 'Global Rank',
                        // Normalize the global rank: lower rank is better, so we invert the score
                        value: globalRankValue > 0 ? Math.max(100 - globalRankValue, 0) : 0,
                        fullMark: 100,
                      },
                      {
                        subject: 'Active Tournaments',
                        value: (playerData.ongoingTournaments || 0) * 20,
                        fullMark: 100,
                      },
                      {
                        subject: 'Organisers Following',
                        value: (playerData.noOfOrgsFollowing || 0) * 10,
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
          </section>
        </div>
      </main>
    </div>
  );
};

export default PlayerProfile;
